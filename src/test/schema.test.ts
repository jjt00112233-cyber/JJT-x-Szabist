import { describe, expect, it } from "vitest";
import { contributions, donationRequests, campaignConfig, adminAuth } from "../../drizzle/schema";
import { getTableColumns } from "drizzle-orm";

describe("Drizzle Schema", () => {
  it("defines the contributions table with all required columns", () => {
    const columns = getTableColumns(contributions);
    expect(columns).toHaveProperty("id");
    expect(columns).toHaveProperty("donor_label");
    expect(columns).toHaveProperty("amount");
    expect(columns).toHaveProperty("purpose");
    expect(columns).toHaveProperty("received_on");
    expect(columns).toHaveProperty("created_at");
  });

  it("defines the donation_requests table with all required columns", () => {
    const columns = getTableColumns(donationRequests);
    expect(columns).toHaveProperty("id");
    expect(columns).toHaveProperty("full_name");
    expect(columns).toHaveProperty("email");
    expect(columns).toHaveProperty("phone");
    expect(columns).toHaveProperty("organization");
    expect(columns).toHaveProperty("donor_type");
    expect(columns).toHaveProperty("intended_amount");
    expect(columns).toHaveProperty("message");
    expect(columns).toHaveProperty("created_at");
  });

  it("defines the admin_auth table with all required columns", () => {
    const columns = getTableColumns(adminAuth);
    expect(columns).toHaveProperty("id");
    expect(columns).toHaveProperty("email");
    expect(columns).toHaveProperty("password_hash");
    expect(columns).toHaveProperty("salt");
    expect(columns).toHaveProperty("updated_at");
  });

  it("defines the campaign_config table with dynamic bank and mobile wallet columns", () => {
    const columns = getTableColumns(campaignConfig);
    expect(columns).toHaveProperty("id");
    expect(columns).toHaveProperty("name");
    expect(columns).toHaveProperty("donation_phone");
    expect(columns).toHaveProperty("contact_email");
    expect(columns).toHaveProperty("goal");
    expect(columns).toHaveProperty("bank_name");
    expect(columns).toHaveProperty("bank_account_title");
    expect(columns).toHaveProperty("bank_identifier_type");
    expect(columns).toHaveProperty("bank_account_number");
    expect(columns).toHaveProperty("bank_iban");
    expect(columns).toHaveProperty("easypaisa_number");
    expect(columns).toHaveProperty("jazzcash_number");
    expect(columns).toHaveProperty("wallet_providers");
    expect(columns).toHaveProperty("wallet_account_number");
    expect(columns).toHaveProperty("wallet_account_title");
    expect(columns).toHaveProperty("wallet2_providers");
    expect(columns).toHaveProperty("wallet2_account_number");
    expect(columns).toHaveProperty("wallet2_account_title");
    expect(columns).toHaveProperty("payment_display_mode");
    expect(columns).toHaveProperty("facebook_url");
    expect(columns).toHaveProperty("instagram_url");
    expect(columns).toHaveProperty("linkedin_url");
    expect(columns).toHaveProperty("whatsapp_number");
    expect(columns).toHaveProperty("whatsapp_url");
    expect(columns).toHaveProperty("payment_instructions");
  });
});
