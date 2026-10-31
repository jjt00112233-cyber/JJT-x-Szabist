import { describe, expect, it } from "vitest";
import {
  verifyCredentials,
  createAdminToken,
  verifyToken,
  hashPassword,
  generateSalt,
  getStoredAdminCredentials,
} from "@/lib/admin";
import { db } from "@/lib/db";
import { adminAuth } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Dynamic Credentials in Neon DB", () => {
  it("verifies login with default credentials", async () => {
    const isValid = await verifyCredentials("admin@jjtrust.org", "jjt-admin-2026");
    expect(isValid).toBe(true);

    const token = createAdminToken("admin@jjtrust.org", "jjt-admin-2026");
    expect(typeof token).toBe("string");
    expect(await verifyToken(token)).toBe(true);
  });

  it("fails verification with incorrect password", async () => {
    const isValid = await verifyCredentials("admin@jjtrust.org", "wrong-password");
    expect(isValid).toBe(false);

    const badToken = createAdminToken("admin@jjtrust.org", "wrong-password");
    expect(await verifyToken(badToken)).toBe(false);
  });

  it("updates credentials dynamically in Neon DB and verifies with new credentials", async () => {
    const newEmail = "updated-admin@jjtrust.org";
    const newPass = "new-secure-pass-2026";
    const salt = generateSalt();
    const password_hash = await hashPassword(newPass, salt);

    // Update in Neon DB
    await db
      .insert(adminAuth)
      .values({
        id: "default",
        email: newEmail,
        password_hash,
        salt,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: adminAuth.id,
        set: {
          email: newEmail,
          password_hash,
          salt,
          updated_at: new Date(),
        },
      });

    // Check stored credentials
    const stored = await getStoredAdminCredentials();
    expect(stored).toBeDefined();
    expect(stored?.email).toBe(newEmail);

    // Verify authentication with new credentials
    const isNewValid = await verifyCredentials(newEmail, newPass);
    expect(isNewValid).toBe(true);

    const newToken = createAdminToken(newEmail, newPass);
    expect(await verifyToken(newToken)).toBe(true);

    // Verify old password fails
    expect(await verifyCredentials(newEmail, "jjt-admin-2026")).toBe(false);

    // Revert back to original credentials
    const origSalt = generateSalt();
    const origHash = await hashPassword("jjt-admin-2026", origSalt);
    await db
      .update(adminAuth)
      .set({
        email: "admin@jjtrust.org",
        password_hash: origHash,
        salt: origSalt,
        updated_at: new Date(),
      })
      .where(eq(adminAuth.id, "default"));

    // Verify reverted credentials work
    expect(await verifyCredentials("admin@jjtrust.org", "jjt-admin-2026")).toBe(true);
  });
});
