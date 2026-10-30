import { ContactActions } from "@/components/ui/ContactActions";

interface StudentContactProps {
  /** Named in the link title, so the office can see whose line it is opening. */
  name: string;
  /** `students.phone` — the student's own mobile. */
  phone?: string | null;
  /** `students.whatsappNumber`; falls back to the mobile when it was left blank. */
  whatsapp?: string | null;
}

/**
 * Call and WhatsApp for one student's own number — never the father's, which
 * has its own column and its own link beside the guardian's name.
 *
 * The affordance itself is `ContactActions`, shared with the other registers
 * that list a number; what this keeps is the rule about whose number belongs
 * here, which is the part that was got wrong before.
 */
export function StudentContact({ name, phone, whatsapp }: StudentContactProps) {
  return <ContactActions name={name} phone={phone} whatsapp={whatsapp} />;
}
