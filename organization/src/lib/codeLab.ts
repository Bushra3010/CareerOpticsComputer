/**
 * The Code Lab's languages, and the program each one opens with.
 *
 * Chosen for what a computer centre teaches — a web page for Web Designing,
 * Python and C for programming, SQL for the DBMS module — rather than for the
 * ninety-odd languages LiveCodes can run. Each starter is a working program,
 * so a student's first Run shows output rather than a blank pane.
 */
import type { Code, Config, Playground } from "livecodes";

export type LabLanguage = "web" | "javascript" | "python" | "c" | "sql";

export const LAB_LANGUAGES: Array<{ id: LabLanguage; label: string; hint: string }> = [
  { id: "web", label: "Web page (HTML, CSS, JS)", hint: "Web Designing" },
  { id: "javascript", label: "JavaScript", hint: "Output in the console" },
  // Real CPython, compiled to WebAssembly: `input()`, the standard library and
  // Python's own error messages, not a lookalike. It is slower to open the
  // first time, because it is a whole interpreter.
  { id: "python", label: "Python", hint: "Loads once, then runs offline in the browser" },
  // Clang compiled to WebAssembly — a real compiler, so a missing semicolon is
  // a compile error with a line number, as it would be in the lab.
  { id: "c", label: "C / C++", hint: "Compiled with Clang in the browser" },
  { id: "sql", label: "SQL", hint: "SQLite, for the DBMS module" },
];

const STARTERS: Record<LabLanguage, Partial<Config>> = {
  web: {
    activeEditor: "markup",
    markup: {
      language: "html",
      content: `<h1>Hello, Career Optics Computer Centre!</h1>
<p>Edit the HTML, CSS and JavaScript tabs, then press Run.</p>
<button id="greet">Click me</button>`,
    },
    style: {
      language: "css",
      content: `body { font-family: system-ui, sans-serif; padding: 24px; }
h1 { color: #b45309; }
button { padding: 8px 16px; border-radius: 8px; }`,
    },
    script: {
      language: "javascript",
      content: `document.getElementById("greet").addEventListener("click", () => {
  alert("Welcome to the Code Lab!");
});`,
    },
  },
  javascript: {
    activeEditor: "script",
    script: {
      language: "javascript",
      content: `// Open the Console below to see the output.
const marks = [78, 91, 64, 85];
const total = marks.reduce((sum, m) => sum + m, 0);
console.log("Total:", total);
console.log("Average:", (total / marks.length).toFixed(1));`,
    },
  },
  python: {
    activeEditor: "script",
    script: {
      language: "pyodide",
      content: `# Open the Console below to see the output.
marks = [78, 91, 64, 85]
total = sum(marks)
print("Total:", total)
print("Average:", round(total / len(marks), 1))`,
    },
  },
  c: {
    activeEditor: "script",
    script: {
      language: "cpp-wasm",
      content: `#include <stdio.h>

int main() {
    int marks[] = {78, 91, 64, 85};
    int total = 0;
    for (int i = 0; i < 4; i++) {
        total += marks[i];
    }
    printf("Total: %d\\n", total);
    printf("Average: %.1f\\n", total / 4.0);
    return 0;
}`,
    },
  },
  sql: {
    activeEditor: "script",
    script: {
      language: "sql",
      content: `CREATE TABLE students (roll INTEGER, name TEXT, marks INTEGER);

INSERT INTO students VALUES
  (1, 'Aman', 78),
  (2, 'Riya', 91),
  (3, 'Karan', 64);

SELECT name, marks FROM students WHERE marks > 70 ORDER BY marks DESC;`,
    },
  },
};

/** The program a new file of this language opens with. */
export function starterConfig(language: LabLanguage, title = "Untitled"): Partial<Config> {
  const tools: Config["tools"] = {
    enabled: ["console"],
    // The console is where JavaScript, Python and C print, so it is opened for
    // them; a web page shows its result instead.
    active: language === "web" ? "" : "console",
    status: language === "web" ? "closed" : "open",
  };
  return { title, tools, ...STARTERS[language] };
}

export const isLabLanguage = (value: string): value is LabLanguage =>
  LAB_LANGUAGES.some((lang) => lang.id === value);

/**
 * A saved file's body back into a config the playground can load.
 *
 * A body that is not valid JSON — a hand-edited row, or a save that was cut
 * off — opens as the language's starter rather than failing the page, and
 * the caller is told so it can say the file could not be read.
 */
export function readSavedConfig(
  content: string,
  language: LabLanguage,
): { config: Partial<Config>; readable: boolean } {
  try {
    const parsed = JSON.parse(content);
    if (parsed && typeof parsed === "object") return { config: parsed as Partial<Config>, readable: true };
  } catch {
    /* falls through to the starter */
  }
  return { config: starterConfig(language), readable: false };
}

/**
 * What the three editors hold, as one comparable string.
 *
 * "Unsaved" means different from what was last opened or saved — not "an
 * edit event fired", because the playground fires one while it loads, which
 * would call a file just opened unsaved.
 */
export const codeFingerprint = (code: Pick<Code, "markup" | "style" | "script">): string =>
  [code.markup?.content ?? "", code.style?.content ?? "", code.script?.content ?? ""].join("\u0000");

/**
 * The full LiveCodes app, self-hosted in public/coder (see
 * scripts/fetch-livecodes.mjs), with its menus, projects, templates,
 * import/export and every language. `full` asks for that UI inside our frame;
 * `welcome=false` and `recoverUnsaved=false` keep its start screen and its
 * "recover your last project?" prompt from covering the file being opened --
 * the student's files are the ones under My files.
 */
export const CODE_LAB_URL = `${import.meta.env.BASE_URL}coder/?full&welcome=false&recoverUnsaved=false`;

/** What the Code Lab page asks of the app: the same calls the SDK offers. */
export type LabApi = Pick<Playground, "getConfig" | "setConfig" | "getCode" | "run">;

/**
 * The app's API, once it has loaded in the frame.
 *
 * The app is on our own origin, so its loader's `window.livecodes` is read
 * straight off the frame -- no postMessage bridge in between. It appears when
 * the app finishes loading, which takes a few seconds the first time (the
 * editors come from a CDN), so this waits for it rather than guessing.
 */
export function waitForLabApi(frame: HTMLIFrameElement, timeoutMs = 60_000): Promise<LabApi> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const check = () => {
      let api: unknown;
      try {
        api = (frame.contentWindow as (Window & { livecodes?: unknown }) | null)?.livecodes;
      } catch {
        return reject(new Error("The Code Lab frame is not on this site."));
      }
      if (api && typeof (api as LabApi).getConfig === "function") return resolve(api as LabApi);
      if (Date.now() - started > timeoutMs) return reject(new Error("The Code Lab took too long to load."));
      setTimeout(check, 250);
    };
    check();
  });
}
