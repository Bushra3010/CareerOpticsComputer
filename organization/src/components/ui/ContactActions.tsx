import { MessageCircle, Phone } from "lucide-react";
import { formatPhone, telHref, whatsappHref } from "@/lib/phone";

interface ContactActionsProps {
  /** Named in the link title, so the caller can see whose line they are opening. */
  name: string;
  /** The mobile to dial. */
  phone?: string | null;
  /** The WhatsApp number; falls back to the mobile when it was left blank. */
  whatsapp?: string | null;
  /** Prints the number under the icons. Off where a column is already tight. */
  showNumber?: boolean;
}

/**
 * Call and WhatsApp for one number, wherever a register lists one — a student,
 * a branch, an enquiry.
 *
 * An action is dropped rather than shown dead when there is nothing dialable:
 * a `tel:` with an empty number and a bare `wa.me/91` both look like working
 * buttons right up until they are pressed. The number is printed under the
 * icons because a pair of bare icons gives no way to tell which line is about
 * to be opened.
 */
export function ContactActions({ name, phone, whatsapp, showNumber = true }: ContactActionsProps) {
  // Somebody who left the WhatsApp box blank still uses WhatsApp on the mobile
  // they gave, which is what these registers used to assume silently.
  const mobile = String(phone ?? "").trim();
  const chatNumber = String(whatsapp ?? "").trim() || mobile;

  const call = telHref(mobile || chatNumber);
  const chat = whatsappHref(chatNumber);

  if (!call && !chat) {
    return <span className="whitespace-nowrap text-xs text-muted-foreground">No number on record</span>;
  }

  const action =
    "inline-flex h-8 w-8 items-center justify-center rounded-md bg-success/12 text-success transition hover:bg-success/20";

  return (
    <div>
      <div className="flex items-center gap-1.5">
        {call && (
          <a
            href={call}
            title={`Call ${name}`}
            aria-label={`Call ${name}`}
            onClick={(e) => e.stopPropagation()}
            className={action}
          >
            <Phone className="h-4 w-4" />
          </a>
        )}
        {chat && (
          <a
            href={chat}
            title={`WhatsApp ${name}`}
            aria-label={`WhatsApp ${name}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={action}
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        )}
      </div>
      {showNumber && (
        <p className="mt-1 whitespace-nowrap text-xs text-muted-foreground">
          {formatPhone(mobile || chatNumber)}
        </p>
      )}
    </div>
  );
}
