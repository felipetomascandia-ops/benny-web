export const companyConfig = {
  name: "USA Pools Services LLC",
  shortName: "USA Pools",
  email: "usapoolservicesllc@gmail.com",
  phoneDigits: "12674503545",
  phoneDisplay: "+1 (267) 450-3545",
  logoPath: "/logo.png",
  serviceArea: "Pennsylvania, USA",
  instagramUrl: "https://www.instagram.com/usapoolservicesllc/",
  facebookUrl: "https://www.facebook.com/usapoolservicesllc/",
};

export const bookingTimeSlots = [
  "14:30",
  "16:30",
];

export function buildWhatsAppUrl(message: string, phone?: string) {
  const targetPhone = phone ? phone.replace(/\D/g, "") : companyConfig.phoneDigits;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
}

export function buildContactWhatsAppMessage(input: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  projectDetails: string;
}) {
  return [
    `Hello ${companyConfig.name},`,
    "",
    "I would like to request a quote.",
    `Name: ${input.firstName} ${input.lastName}`.trim(),
    `Phone: ${input.phone}`,
    `Email: ${input.email}`,
    "",
    "Project details:",
    input.projectDetails,
  ].join("\n");
}

export function buildBookingWhatsAppMessage(input: {
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  projectDetails?: string;
  reservationDate: string;
  reservationTime: string;
}) {
  return [
    `Hello ${companyConfig.name},`,
    "",
    "A visit was booked from the website.",
    `Client: ${input.customerName}`,
    `Phone: ${input.phone}`,
    `Email: ${input.email || "Not provided"}`,
    `Address: ${input.address || "Not provided"}`,
    `Date: ${input.reservationDate}`,
    `Time: ${input.reservationTime}`,
    `Details: ${input.projectDetails || "Not provided"}`,
  ].join("\n");
}
