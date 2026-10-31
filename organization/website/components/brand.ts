/**
 * Who the website speaks for, written once. The header, footer, home page and
 * certifications page all read from here, so a new phone number or address is
 * one edit. Every registration below is copied from the certificate it names.
 */
export const BRAND = {
  name: "Career Optics Computer Academy",
  short: "Career Optics",
  company: "Career Optics Education Service Private Limited",
  tagline: "Learn • Grow • Succeed",
  motto: "Skill Today, Success Tomorrow",
  phone: "8252532179",
  phoneIntl: "918252532179",
  altPhone: "7372001707",
  email: "careeropticsconsultancy@gmail.com",
  address: "Hariom Gupta Building, Bandhan Tola, Nawada, Ara, Bhojpur, Bihar – 802301",
  addressShort: "Bandhan Tola, Nawada, Ara (Bhojpur), Bihar",
  studentLogin: "/computercentre/login?as=student",
  centreLogin: "/computercentre/login?as=franchise",
};

export type Registration = {
  /** File name under /image/certificates, without extension. */
  file: string;
  title: string;
  authority: string;
  label: string;
  value: string;
  extra?: string;
};

export const REGISTRATIONS: Registration[] = [
  {
    file: "mca-incorporation",
    title: "Certificate of Incorporation",
    authority: "Ministry of Corporate Affairs, Govt. of India",
    label: "CIN",
    value: "U85500BR2026PTC085770",
    extra: "Incorporated on 19 June 2026 under the Companies Act, 2013",
  },
  {
    file: "iso-9001-2015",
    title: "ISO 9001:2015 Certified",
    authority: "Quality Management System",
    label: "Certificate No.",
    value: "INQ/AN-23100/1/0726",
    extra: "Valid 29 July 2026 to 28 July 2029",
  },
  {
    file: "msme-udyam",
    title: "MSME Udyam Registration",
    authority: "Ministry of Micro, Small & Medium Enterprises, Govt. of India",
    label: "Udyam No.",
    value: "UDYAM-BR-08-0043839",
    extra: "Educational support services (NIC 85500)",
  },
  {
    file: "income-tax-tan",
    title: "TAN Allotment",
    authority: "Income Tax Department, Govt. of India",
    label: "TAN",
    value: "PTNC05722D",
    extra: "Allotted on 19 June 2026",
  },
];
