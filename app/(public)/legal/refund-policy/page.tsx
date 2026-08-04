import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund policy",
};

export default function RefundPolicyPage() {
  return (
    <div className="container-public max-w-3xl py-12">
      <h1 className="text-page-title text-navy-900">Refund policy</h1>
      <p className="text-meta text-text-secondary mt-2">
        Draft — pending legal review.
      </p>

      <div className="text-body text-text mt-8 space-y-6">
        <section>
          <h2 className="text-section text-navy-900">
            Before the course starts
          </h2>
          <p className="mt-2">
            A full refund, less any processing charge disclosed at the time of
            payment, is available if a request is made before your batch&rsquo;s
            first scheduled session.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">
            After the course starts
          </h2>
          <p className="mt-2">
            Refunds after the course has started are prorated based on sessions
            attended and course materials issued, at the discretion of the
            centre and subject to head-office policy limits.
          </p>
        </section>
        <section>
          <h2 className="text-section text-navy-900">
            How to request a refund
          </h2>
          <p className="mt-2">
            Refund requests are made through your centre. Approved refunds are
            processed to the original payment method within the timeline your
            centre confirms at the time of approval.
          </p>
        </section>
      </div>
    </div>
  );
}
