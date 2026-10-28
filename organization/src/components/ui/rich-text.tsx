import { sanitizeRichText } from "@/lib/rich-text";
import { cn } from "@/lib/utils";

/**
 * Formatted text, shown. Every path into `dangerouslySetInnerHTML` in this app
 * goes through here, so the sanitiser can never be forgotten at the one call
 * site that mattered.
 */
export function RichText({
  html,
  className,
  as: Tag = "div",
}: {
  html: string;
  className?: string;
  as?: "div" | "span";
}) {
  return (
    <Tag
      className={cn("rich-text", className)}
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}
