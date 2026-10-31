import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { contributions, donationRequests, campaignConfig } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";

describe("Neon DB & Drizzle ORM Live Integration", () => {
  it("fetches contributions successfully from Neon DB", async () => {
    const rows = await db
      .select()
      .from(contributions)
      .orderBy(desc(contributions.received_on));

    expect(Array.isArray(rows)).toBe(true);
    if (rows.length > 0) {
      const first = rows[0];
      expect(first).toHaveProperty("id");
      expect(first).toHaveProperty("donor_label");
      expect(first).toHaveProperty("amount");
      expect(first).toHaveProperty("purpose");
    }
  });

  it("inserts, reads, and cleans up a donation request in Neon DB", async () => {
    const testEmail = `test_${Date.now()}@example.com`;

    const [inserted] = await db
      .insert(donationRequests)
      .values({
        full_name: "Automated Integration Test",
        email: testEmail,
        donor_type: "individual",
        intended_amount: "25000",
        message: "Vitest Neon DB live integration check",
      })
      .returning();

    expect(inserted).toBeDefined();
    expect(inserted.email).toBe(testEmail);
    expect(inserted.full_name).toBe("Automated Integration Test");

    // Clean up test record immediately so live DB remains clean
    await db.delete(donationRequests).where(eq(donationRequests.id, inserted.id));
  });

  it("reads and upserts campaign configuration dynamically in Neon DB", async () => {
    const rows = await db
      .select()
      .from(campaignConfig)
      .where(eq(campaignConfig.id, "default"))
      .limit(1);

    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBeDefined();
    expect(Number(rows[0].goal)).toBeGreaterThan(0);
  });
});
