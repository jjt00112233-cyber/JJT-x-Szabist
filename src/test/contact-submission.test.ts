import { describe, expect, it } from "vitest";
import { db } from "@/lib/db";
import { donationRequests } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Contact Inquiries Database Integration", () => {
  it("allows submitting contact inquiries with donor_type = 'contact'", async () => {
    const testEmail = `contact_test_${Date.now()}@example.com`;

    const [inserted] = await db
      .insert(donationRequests)
      .values({
        full_name: "Arisha Fatima",
        email: testEmail,
        phone: "03130188137",
        donor_type: "contact",
        message: "hello from automated contact test",
      })
      .returning();

    expect(inserted).toBeDefined();
    expect(inserted.donor_type).toBe("contact");
    expect(inserted.full_name).toBe("Arisha Fatima");

    // Clean up record
    await db.delete(donationRequests).where(eq(donationRequests.id, inserted.id));
  });
});
