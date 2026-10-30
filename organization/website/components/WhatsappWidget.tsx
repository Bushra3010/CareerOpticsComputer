/** Shared by every page that carries it; written once here. */
export default function WhatsappWidget() {
  return (
    <div id="whatsappWidget" className="fixed bottom-5 right-5 z-[99999] font-sans">
      <div id="whatsappPanel" className="hidden absolute bottom-[75px] right-0 w-[350px] max-w-[calc(100vw-30px)] overflow-hidden rounded-2xl bg-white shadow-[0_15px_50px_rgba(0,0,0,.25)] border border-gray-200 origin-bottom-right transition-all duration-300">
        <div className="bg-[#075E54] px-4 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src="/logo.webp" alt="Support" className="h-11 w-11 rounded-full border-2 border-white object-cover bg-white" />
                {" "}
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#075E54] bg-[#25D366]">
                  {" "}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  Support Team
                </h3>
                <p className="text-[10px] text-green-100">
                  ● Typically replies instantly
                </p>
              </div>
            </div>
            <button id="closeWhatsapp" className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-white/10 text-xl">
              ×
            </button>
          </div>
        </div>
        <div className="bg-[#efeae2] px-3 py-4">
          <p className="mb-2 px-1 text-[11px] font-semibold text-gray-500">
            Choose a department
          </p>
          <div className="space-y-2">
            <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I want information about admission and courses.">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                A
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-800">
                  Admission
                </h4>
                <p className="text-[10px] text-gray-500">
                  Course & admission enquiry
                </p>
              </div>
              <span className="text-[#25D366]">
                {" "}→{" "}
              </span>
            </button>
            {" "}
            {" "}
            <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I want information about fees and payment.">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                ₹
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-800">
                  Fees & Accounts
                </h4>
                <p className="text-[10px] text-gray-500">
                  Fees & payment enquiry
                </p>
              </div>
              <span className="text-[#25D366]">
                {" "}→{" "}
              </span>
            </button>
            {" "}
            {" "}
            <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I need technical support.">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                S
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-800">
                  Career Counseling
                </h4>
                <p className="text-[10px] text-gray-500">
                  Job Placement & Internship
                </p>
              </div>
              <span className="text-[#25D366]">
                {" "}→{" "}
              </span>
            </button>
            {" "}
            {" "}
            <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I need technical support.">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                S
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-800">
                  Technical Support
                </h4>
                <p className="text-[10px] text-gray-500">
                  Technical help & support
                </p>
              </div>
              <span className="text-[#25D366]">
                {" "}→{" "}
              </span>
            </button>
            {" "}
            {" "}
            <button className="wa-department flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" data-number="918252532179" data-message="Hello, I am interested in franchise.">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                F
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-gray-800">
                  Franchise
                </h4>
                <p className="text-[10px] text-gray-500">
                  Franchise enquiry
                </p>
              </div>
              <span className="text-[#25D366]">
                {" "}→{" "}
              </span>
            </button>
          </div>
        </div>
        <div className="border-t bg-white px-3 py-2 text-center">
          <p className="text-[9px] text-gray-400">
            Powered by WhatsApp
          </p>
        </div>
      </div>
      <button id="whatsappButton" aria-label="WhatsApp Chat" className="group relative flex h-[62px] w-[62px] items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_30px_rgba(37,211,102,.45)] transition-all duration-300 hover:scale-110 hover:bg-[#20bd5a]">
        <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20">
          {" "}
        </span>
        <svg viewBox="0 0 32 32" className="relative z-10 h-9 w-9 fill-white" aria-hidden="true">
          <path d="M19.11 17.08c-.27-.14-1.59-.78-1.84-.87 -.25-.09-.43-.14-.61.14 -.18.27-.7.87-.86 1.04 -.16.18-.32.2-.59.07 -.27-.14-1.12-.41-2.13-1.31 -.79-.7-1.32-1.57-1.47-1.84 -.16-.27-.02-.42.12-.56 .12-.12.27-.32.41-.48 .14-.16.18-.27.27-.45 .09-.18.05-.34-.02-.48 -.07-.14-.61-1.47-.84-2.01 -.22-.53-.45-.46-.61-.47 -.16-.01-.34-.01-.52-.01 -.18 0-.48.07-.73.34 -.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.11 2.81 .14.18 1.92 2.93 4.65 4.11 .65.28 1.16.45 1.56.58 .66.21 1.26.18 1.73.11 .53-.08 1.59-.65 1.81-1.28 .22-.63.22-1.17.16-1.28 -.07-.11-.25-.18-.52-.32z"></path>
          {" "}
          <path d="M16 3.2C8.93 3.2 3.2 8.93 3.2 16 c0 2.26.59 4.38 1.63 6.22L3 29 l6.98-1.83A12.73 12.73 0 0 0 16 28.8 c7.07 0 12.8-5.73 12.8-12.8 S23.07 3.2 16 3.2zm0 23.35 c-2.01 0-3.88-.58-5.46-1.58 l-.39-.24-4.14 1.08 1.1-4.03 -.26-.41A10.55 10.55 0 1 1 16 26.55z"></path>
        </svg>
        <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-red-500 text-[9px] font-bold">
          1
        </span>
      </button>
    </div>
  );
}
