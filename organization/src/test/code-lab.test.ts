import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

import { CODE_LAB_URL, LAB_LANGUAGES, codeFingerprint, isLabLanguage, readSavedConfig, starterConfig, waitForLabApi } from "@/lib/codeLab";
import { canAccess } from "@/lib/navigation";

describe("Code Lab starters", () => {
  // A first Run should show output, not a blank pane.
  it("opens every language with a program already in it", () => {
    for (const { id } of LAB_LANGUAGES) {
      const config = starterConfig(id);
      const content = [config.markup?.content, config.script?.content].filter(Boolean).join("");
      expect(content.length, `${id} has no starter`).toBeGreaterThan(20);
    }
  });

  it("runs Python as real CPython and C with a real compiler", () => {
    expect(starterConfig("python").script?.language).toBe("pyodide");
    expect(starterConfig("c").script?.language).toBe("cpp-wasm");
  });

  it("opens the console for languages that print, and not for a web page", () => {
    expect(starterConfig("python").tools?.status).toBe("open");
    expect(starterConfig("web").tools?.status).toBe("closed");
  });

  it("carries the title given", () => {
    expect(starterConfig("sql", "Joins").title).toBe("Joins");
  });
});

describe("readSavedConfig", () => {
  it("reads a saved project back", () => {
    const saved = JSON.stringify({ title: "Mine", script: { language: "pyodide", content: "print(1)" } });
    const { config, readable } = readSavedConfig(saved, "python");
    expect(readable).toBe(true);
    expect(config.script?.content).toBe("print(1)");
  });

  // A hand-edited row or a cut-off save must not fail the page.
  it("opens the starter, and says so, when the body cannot be read", () => {
    const { config, readable } = readSavedConfig("{not json", "python");
    expect(readable).toBe(false);
    expect(config.script?.language).toBe("pyodide");
  });
});

describe("codeFingerprint", () => {
  const code = (script: string) => ({
    markup: { language: "html" as const, content: "", compiled: "" },
    style: { language: "css" as const, content: "", compiled: "" },
    script: { language: "javascript" as const, content: script, compiled: "" },
  });

  it("is the same for the same code and differs on any edit", () => {
    expect(codeFingerprint(code("a"))).toBe(codeFingerprint(code("a")));
    expect(codeFingerprint(code("a"))).not.toBe(codeFingerprint(code("a ")));
  });

  // Editor boundaries matter: moving text between tabs is a change.
  it("does not confuse text moved from one editor to another", () => {
    const a = { ...code("x"), markup: { language: "html" as const, content: "ab", compiled: "" } };
    const b = { ...code("bx"), markup: { language: "html" as const, content: "a", compiled: "" } };
    expect(codeFingerprint(a)).not.toBe(codeFingerprint(b));
  });
});

describe("isLabLanguage", () => {
  it("accepts the lab's own ids only", () => {
    expect(isLabLanguage("python")).toBe(true);
    expect(isLabLanguage("cobol")).toBe(false);
  });
});

describe("who can open the tools", () => {
  it("is every view: the teacher, the branch and the student", () => {
    for (const path of ["/tools/code-lab", "/tools/whiteboard"]) {
      expect(canAccess("admin", path)).toBe(true);
      expect(canAccess("franchise", path)).toBe(true);
      expect(canAccess("student", path)).toBe(true);
    }
  });
});

describe("the full LiveCodes app", () => {
  const coder = path.resolve(__dirname, "../../public/coder");

  it("is self-hosted, with the loader patched to open its full UI in our frame", () => {
    const loader = fs.readdirSync(path.join(coder, "livecodes")).find((f) => /^index\.[a-f0-9]+\.js$/.test(f));
    expect(loader, "run node scripts/fetch-livecodes.mjs").toBeDefined();
    const source = fs.readFileSync(path.join(coder, "livecodes", loader!), "utf8");
    expect(source).toContain('O()&&r.get("full")==null');
    expect(fs.existsSync(path.join(coder, "index.html"))).toBe(true);
    expect(fs.existsSync(path.join(coder, "app.html"))).toBe(true);
  });

  it("is opened in full mode, with nothing popping up over the file", () => {
    expect(CODE_LAB_URL).toMatch(/coder\/\?full&welcome=false&recoverUnsaved=false$/);
  });

  it("hands over the app's API once it has loaded", async () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    const api = { getConfig: () => Promise.resolve({}) };
    setTimeout(() => Object.assign(frame.contentWindow!, { livecodes: api }), 300);
    await expect(waitForLabApi(frame, 5_000)).resolves.toBe(api);
    frame.remove();
  });

  it("gives up on an app that never loads", async () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    await expect(waitForLabApi(frame, 300)).rejects.toThrow(/too long/);
    frame.remove();
  });
});
