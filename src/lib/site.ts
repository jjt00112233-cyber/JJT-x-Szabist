export const SITE = {
  name: "JJT × SZABIST Community",
  supporting: "supporting Junior Jinnah Trust",
  donationPhone: "03219519360",
  contactEmail: "jjtszabist.isb@gmail.com",
  goal: 100000,
};

export function formatRs(n: number) {
  return "Rs " + Math.round(n).toLocaleString("en-PK");
}

export function gmailComposeUrl(email?: string) {
  const targetEmail = email && email.trim() ? email.trim() : SITE.contactEmail;
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(targetEmail)}`;
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
