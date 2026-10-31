import { describe, expect, it } from "vitest";
import {
  verifyCredentials,
  createAdminToken,
  verifyToken,
  hashPassword,
  generateSalt,
  getStoredAdminCredentials,
  extractEmailFromToken,
} from "@/lib/admin";
import { db } from "@/lib/db";
import { adminAuth } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Admin Dynamic Credentials & HMAC-SHA256 Token Security", () => {
  it("verifies login with default credentials", async () => {
    const isValid = await verifyCredentials("admin@jjtrust.org", "jjt-admin-2026");
    expect(isValid).toBe(true);

    const token = await createAdminToken("admin@jjtrust.org");
    expect(typeof token).toBe("string");
    expect(token.includes(".")).toBe(true); // payload.signature format
    expect(await verifyToken(token)).toBe(true);
  });

  it("fails verification with incorrect password", async () => {
    const isValid = await verifyCredentials("admin@jjtrust.org", "wrong-password");
    expect(isValid).toBe(false);
  });

  it("issues signed tokens without exposing the password", async () => {
    const token = await createAdminToken("admin@jjtrust.org");
    const [payloadB64] = token.split(".");
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const parsed = JSON.parse(decoded);

    expect(parsed.email).toBe("admin@jjtrust.org");
    expect(parsed.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
    expect(parsed.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
    expect(parsed).not.toHaveProperty("password");
    expect(parsed).not.toHaveProperty("pass");
  });

  it("rejects tampered tokens with invalid HMAC signatures", async () => {
    const token = await createAdminToken("admin@jjtrust.org");
    const [payloadB64] = token.split(".");
    // Tamper with signature
    const tamperedToken = `${payloadB64}.invalid_signature_string`;
    expect(await verifyToken(tamperedToken)).toBe(false);
  });

  it("rejects expired tokens", async () => {
    // Issue token that expires immediately (-10 seconds)
    const expiredToken = await createAdminToken("admin@jjtrust.org", undefined, -10);
    expect(await verifyToken(expiredToken)).toBe(false);
  });

  it("extracts email correctly from signed token without decoding password", async () => {
    const token = await createAdminToken("admin@jjtrust.org");
    expect(extractEmailFromToken(token)).toBe("admin@jjtrust.org");
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

    const newToken = await createAdminToken(newEmail);
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
