export const SITE = {
  name: "JJT × SZABIST Community",
  supporting: "supporting Junior Jinnah Trust",
  donationPhone: "03219519360",
  contactEmail: "jjtszabist.isb@gmail.com",
  goal: 100000,
  bankName: "Meezan Bank",
  bankAccountTitle: "Junior Jinnah Trust",
  bankAccountNumber: "01010101010101",
  bankIban: "PK00MEZN0001010101010101",
  easypaisaNumber: "03219519360",
  easypaisaTitle: "Junior Jinnah Trust",
  jazzcashNumber: "03219519360",
  jazzcashTitle: "Junior Jinnah Trust",
  walletProviders: "EasyPaisa, JazzCash, SadaPay, NayaPay",
  walletAccountNumber: "03219519360",
  walletAccountTitle: "Junior Jinnah Trust",
  wallet2Providers: "",
  wallet2AccountNumber: "",
  wallet2AccountTitle: "",
  paymentInstructions: "Please use your name as the transfer reference and upload your receipt screenshot below.",
};

export const MOBILE_WALLET_OPTIONS = [
  "EasyPaisa",
  "JazzCash",
  "SadaPay",
  "NayaPay",
  "Raast",
] as const;

export function formatRs(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

export function gmailComposeUrl(email?: string) {
  const targetEmail = email && email.trim() ? email.trim() : SITE.contactEmail;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}`;
}

export function formatWhatsAppUrl(phone?: string) {
  const clean = (phone || SITE.donationPhone).replace(/[^0-9]/g, "");
  const intl = clean.startsWith("0") ? "92" + clean.slice(1) : clean.startsWith("92") ? clean : "92" + clean;
  return `https://wa.me/${intl}`;
}

export const SUGGESTED_CONTRIBUTIONS = [
  { amount: 20000, title: "Essential learning supplies", text: "Help provide the textbooks, exercise books and stationery children need for everyday lessons." },
  { amount: 30000, title: "School uniforms & shoes", text: "Help children attend school with properly fitting uniforms and sturdy shoes." },
  { amount: 40000, title: "Nutritious school meals", text: "Support regular, nourishing meals so hunger does not stand in the way of learning." },
  { amount: 50000, title: "Teaching & daily education", text: "Support teachers and the daily school essentials that keep children learning consistently." },
  { amount: 75000, title: "Safe drinking water", text: "Help provide clean drinking water and maintain the water facilities children rely on." },
  { amount: 100000, title: "Essential classroom facilities", text: "Help provide safe desks, usable boards and adequate lighting for everyday learning." },
] as const;

export {
  getCampaignConfig,
  campaignConfigQuery,
  useCampaignConfig,
  type CampaignConfig,
} from "./campaign";
