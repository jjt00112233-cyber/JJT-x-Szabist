import { pgTable, uuid, text, numeric, timestamp, date } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const donationRequests = pgTable("donation_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  full_name: text("full_name").notNull(),
  organization: text("organization"),
  email: text("email").notNull(),
  phone: text("phone"),
  donor_type: text("donor_type").notNull().default("individual"),
  intended_amount: numeric("intended_amount"),
  message: text("message"),
  payment_proof_url: text("payment_proof_url"),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: uuid("id").primaryKey().defaultRandom(),
  donor_label: text("donor_label").notNull().default("Anonymous"),
  amount: numeric("amount").notNull(),
  purpose: text("purpose"),
  payment_proof_url: text("payment_proof_url"),
  received_on: date("received_on").notNull().default(sql`CURRENT_DATE`),
  created_at: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const campaignConfig = pgTable("campaign_config", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default("JJT × SZABIST Community"),
  supporting: text("supporting").notNull().default("supporting Junior Jinnah Trust"),
  donation_phone: text("donation_phone").notNull().default("03219519360"),
  contact_email: text("contact_email").notNull().default("jjtszabist.isb@gmail.com"),
  goal: numeric("goal").notNull().default("100000"),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminAuth = pgTable("admin_auth", {
  id: text("id").primaryKey().default("default"),
  email: text("email").notNull().default("admin@jjtrust.org"),
  password_hash: text("password_hash").notNull(),
  salt: text("salt").notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DonationRequest = typeof donationRequests.$inferSelect;
export type NewDonationRequest = typeof donationRequests.$inferInsert;

export type Contribution = typeof contributions.$inferSelect;
export type NewContribution = typeof contributions.$inferInsert;

export type CampaignConfigRow = typeof campaignConfig.$inferSelect;
export type NewCampaignConfigRow = typeof campaignConfig.$inferInsert;

export type AdminAuthRow = typeof adminAuth.$inferSelect;
export type NewAdminAuthRow = typeof adminAuth.$inferInsert;
