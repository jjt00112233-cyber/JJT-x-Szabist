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
});
