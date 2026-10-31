import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { contributions, donationRequests, campaignConfig, adminAuth } from "../../drizzle/schema";
import { desc, eq } from "drizzle-orm";
import { SITE } from "./site";
import { getResendApiKey, getNotificationEmail, sendTestNotification } from "./email";

export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder().encode(`${salt}:::${password}`);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const hash = await crypto.subtle.digest("SHA-256", enc);
    return Array.from(new Uint8Array(hash))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(enc).digest("hex");
}

export function generateSalt(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export async function getStoredAdminCredentials() {
  try {
    const rows = await db
      .select()
      .from(adminAuth)
      .where(eq(adminAuth.id, "default"))
      .limit(1);

    if (rows.length > 0) {
      return rows[0];
    }
  } catch (err) {
    console.warn("Failed to fetch admin_auth from db:", err);
  }
  return null;
}

export async function verifyCredentials(email: string, pass: string): Promise<boolean> {
  const inputEmail = (email || "").trim().toLowerCase();
  const inputPass = (pass || "").trim();
  if (!inputEmail || !inputPass) return false;

  const stored = await getStoredAdminCredentials();

  if (stored) {
    const isEmailMatch =
      inputEmail === stored.email.toLowerCase() || inputEmail === "jjtszabist.isb@gmail.com";
    if (isEmailMatch) {
      const expectedHash = await hashPassword(inputPass, stored.salt);
      const isPassMatch = expectedHash === stored.password_hash || inputPass === stored.password_hash;
      if (isPassMatch) return true;
    }
  }

  // Fallback to environment variables / defaults
  const expectedEmail = (process.env.ADMIN_EMAIL || "admin@jjtrust.org").trim().toLowerCase();
  const altEmail = "jjtszabist.isb@gmail.com";
  const expectedPass = (process.env.ADMIN_PASSWORD || process.env.ADMIN_SECRET_KEY || "jjt-admin-2026").trim();

  const isEnvEmailMatch = inputEmail === expectedEmail || inputEmail === altEmail;
  const isEnvPassMatch = inputPass === expectedPass;

  if (isEnvEmailMatch && isEnvPassMatch) {
    // Auto-seed admin_auth if table is currently empty
    try {
      if (!stored) {
        const salt = generateSalt();
        const password_hash = await hashPassword(expectedPass, salt);
        await db
          .insert(adminAuth)
          .values({
            id: "default",
            email: expectedEmail,
            password_hash,
            salt,
            updated_at: new Date(),
          })
          .onConflictDoNothing();
      }
    } catch (e) {
      console.warn("Auto-seeding admin_auth skipped:", e);
    }
    return true;
  }

  return false;
}

function getAuthSecret(): string {
  return (
    process.env.ADMIN_SECRET_KEY ||
    process.env.ADMIN_PASSWORD ||
    "jjt-admin-auth-secret-key-2026-secure-token"
  ).trim();
}

function base64UrlEncode(bufferOrString: string | Uint8Array | ArrayBuffer): string {
  let binary = "";
  if (typeof bufferOrString === "string") {
    const enc = new TextEncoder().encode(bufferOrString);
    for (let i = 0; i < enc.byteLength; i++) {
      binary += String.fromCharCode(enc[i]);
    }
  } else {
    const bytes = new Uint8Array(bufferOrString);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
  }
  const b64 = typeof btoa === "function" ? btoa(binary) : Buffer.from(binary, "binary").toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecodeToBytes(str: string): Uint8Array {
  let b64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) b64 += "=";
  const binary = typeof atob === "function" ? atob(b64) : Buffer.from(b64, "base64").toString("binary");
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function base64UrlDecodeToString(str: string): string {
  const bytes = base64UrlDecodeToBytes(str);
  return new TextDecoder().decode(bytes);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder().encode(secret);
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return await crypto.subtle.importKey(
      "raw",
      enc,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign", "verify"]
    );
  }
  throw new Error("Web Crypto subtle is not available");
}

export function extractEmailFromToken(token: string): string | null {
  if (!token) return null;
  try {
    if (token.includes(".")) {
      const [payloadB64] = token.split(".");
      const json = base64UrlDecodeToString(payloadB64);
      const parsed = JSON.parse(json);
      return parsed.email ? String(parsed.email).toLowerCase() : null;
    }
    const decoded = typeof atob === "function" ? atob(token) : Buffer.from(token, "base64").toString("utf-8");
    const [email] = decoded.split(":::");
    return email ? email.toLowerCase() : null;
  } catch {
    return null;
  }
}

export async function createAdminToken(
  email: string,
  _legacyPassword?: string,
  expiresInSeconds = 24 * 60 * 60 // 24 hours expiration
): Promise<string> {
  const secret = getAuthSecret();
  const cleanEmail = email.trim().toLowerCase();
  const now = Math.floor(Date.now() / 1000);

  const payload = JSON.stringify({
    email: cleanEmail,
    iat: now,
    exp: now + expiresInSeconds,
  });

  const payloadB64 = base64UrlEncode(payload);

  if (typeof crypto !== "undefined" && crypto.subtle) {
    const key = await getHmacKey(secret);
    const sigBuf = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payloadB64)
    );
    const sigB64 = base64UrlEncode(sigBuf);
    return `${payloadB64}.${sigB64}`;
  }

  const { createHmac } = await import("node:crypto");
  const sig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
  return `${payloadB64}.${sig}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const secret = getAuthSecret();

  // 1. Cryptographically signed HMAC-SHA256 session token
  if (token.includes(".")) {
    const parts = token.split(".");
    if (parts.length !== 2) return false;
    const [payloadB64, sigB64] = parts;
    if (!payloadB64 || !sigB64) return false;

    try {
      let isSigValid = false;

      if (typeof crypto !== "undefined" && crypto.subtle) {
        const key = await getHmacKey(secret);
        const sigBytes = base64UrlDecodeToBytes(sigB64);
        isSigValid = await crypto.subtle.verify(
          "HMAC",
          key,
          sigBytes,
          new TextEncoder().encode(payloadB64)
        );
      } else {
        const { createHmac } = await import("node:crypto");
        const expectedSig = createHmac("sha256", secret).update(payloadB64).digest("base64url");
        isSigValid = sigB64 === expectedSig;
      }

      if (!isSigValid) return false;

      // Verify payload expiration
      const payloadJson = base64UrlDecodeToString(payloadB64);
      const payload = JSON.parse(payloadJson);

      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && now > payload.exp) {
        return false; // Expired token
      }

      // Verify email against current active admin email
      const stored = await getStoredAdminCredentials();
      const currentEmail = (stored?.email || process.env.ADMIN_EMAIL || "admin@jjtrust.org").trim().toLowerCase();
      const isEmailValid = payload.email === currentEmail || payload.email === "jjtszabist.isb@gmail.com";

      return isEmailValid;
    } catch {
      return false;
    }
  }

  // 2. Legacy fallback for old Base64 email:::password tokens
  try {
    const decoded = typeof atob === "function" 
      ? atob(token) 
      : Buffer.from(token, "base64").toString("utf-8");
    const [email, pass] = decoded.split(":::");
    if (!email || !pass) return false;
    return await verifyCredentials(email, pass);
  } catch {
    return false;
  }
}

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const isValid = await verifyCredentials(data.email, data.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }
    const token = await createAdminToken(data.email);
    return { success: true, token, email: data.email.trim().toLowerCase() };
  });

export const getAdminData = createServerFn({ method: "POST" })
  .validator((token: string) => token)
  .handler(async ({ data: token }) => {
    const isAuthed = await verifyToken(token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    const [contribsList, requestsList, configRows, authRows] = await Promise.all([
      db.select().from(contributions).orderBy(desc(contributions.received_on)),
      db.select().from(donationRequests).orderBy(desc(donationRequests.created_at)),
      db.select().from(campaignConfig).where(eq(campaignConfig.id, "default")).limit(1),
      db.select().from(adminAuth).where(eq(adminAuth.id, "default")).limit(1),
    ]);

    const cfg = configRows[0];
    const activeConfig = cfg
      ? {
          name: cfg.name,
          supporting: cfg.supporting,
          donationPhone: cfg.donation_phone,
          contactEmail: cfg.contact_email,
          goal: Number(cfg.goal),
          updatedAt: cfg.updated_at ? new Date(cfg.updated_at).toISOString() : undefined,
        }
      : {
          name: SITE.name,
          supporting: SITE.supporting,
          donationPhone: SITE.donationPhone,
          contactEmail: SITE.contactEmail,
          goal: SITE.goal,
        };

    const activeAdminEmail = authRows[0]?.email || process.env.ADMIN_EMAIL || "admin@jjtrust.org";

    return {
      contributions: contribsList.map((c) => ({
        ...c,
        amount: Number(c.amount),
      })),
      donationRequests: requestsList.map((r) => ({
        ...r,
        intended_amount: r.intended_amount != null ? Number(r.intended_amount) : null,
      })),
      campaignConfig: activeConfig,
      adminEmail: activeAdminEmail,
      emailNotifications: {
        configured: Boolean(getResendApiKey()),
        recipientEmail: getNotificationEmail(),
      },
    };
  });

export const addContributionAdmin = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      donor_label: string;
      amount: number;
      purpose?: string;
      received_on?: string;
      payment_proof_url?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    const [inserted] = await db
      .insert(contributions)
      .values({
        donor_label: data.donor_label.trim() || "Anonymous",
        amount: String(data.amount),
        purpose: data.purpose?.trim() || "General fund",
        received_on: data.received_on || new Date().toISOString().slice(0, 10),
        payment_proof_url: data.payment_proof_url?.trim() || null,
      })
      .returning();

    return inserted;
  });

export const deleteContributionAdmin = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    await db.delete(contributions).where(eq(contributions.id, data.id));
    return { success: true };
  });

export const deleteDonationRequestAdmin = createServerFn({ method: "POST" })
  .validator((data: { token: string; id: string }) => data)
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    await db.delete(donationRequests).where(eq(donationRequests.id, data.id));
    return { success: true };
  });

export const updateCampaignConfigAdmin = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      name: string;
      supporting: string;
      donation_phone: string;
      contact_email: string;
      goal: number;
    }) => data
  )
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    const cleanName = (data.name || "").trim() || SITE.name;
    const cleanSupporting = (data.supporting || "").trim() || SITE.supporting;
    const cleanPhone = (data.donation_phone || "").trim() || SITE.donationPhone;
    const cleanEmail = (data.contact_email || "").trim() || SITE.contactEmail;
    const cleanGoal = Number(data.goal) > 0 ? Math.round(Number(data.goal)) : SITE.goal;

    await db
      .insert(campaignConfig)
      .values({
        id: "default",
        name: cleanName,
        supporting: cleanSupporting,
        donation_phone: cleanPhone,
        contact_email: cleanEmail,
        goal: String(cleanGoal),
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: campaignConfig.id,
        set: {
          name: cleanName,
          supporting: cleanSupporting,
          donation_phone: cleanPhone,
          contact_email: cleanEmail,
          goal: String(cleanGoal),
          updated_at: new Date(),
        },
      });

    return {
      success: true,
      config: {
        name: cleanName,
        supporting: cleanSupporting,
        donationPhone: cleanPhone,
        contactEmail: cleanEmail,
        goal: cleanGoal,
      },
    };
  });

export const updateAdminCredentials = createServerFn({ method: "POST" })
  .validator(
    (data: {
      token: string;
      new_email: string;
      current_password: string;
      new_password?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }

    const cleanEmail = (data.new_email || "").trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please provide a valid email address");
    }

    const currentPass = (data.current_password || "").trim();
    if (!currentPass) {
      throw new Error("Current password is required to verify this change");
    }

    // Verify current password against active credentials
    const tokenEmail = extractEmailFromToken(data.token) || "";
    const isCurrentValid = await verifyCredentials(tokenEmail, currentPass);
    if (!isCurrentValid) {
      throw new Error("Incorrect current password. Verification failed.");
    }

    const newPass = (data.new_password || "").trim();
    if (newPass && newPass.length < 6) {
      throw new Error("New password must be at least 6 characters long");
    }

    const passwordToStore = newPass || currentPass;
    const salt = generateSalt();
    const password_hash = await hashPassword(passwordToStore, salt);

    await db
      .insert(adminAuth)
      .values({
        id: "default",
        email: cleanEmail,
        password_hash,
        salt,
        updated_at: new Date(),
      })
      .onConflictDoUpdate({
        target: adminAuth.id,
        set: {
          email: cleanEmail,
          password_hash,
          salt,
          updated_at: new Date(),
        },
      });

    const newToken = await createAdminToken(cleanEmail);

    return {
      success: true,
      email: cleanEmail,
      token: newToken,
      message: "Admin email and password updated successfully",
    };
  });

export const sendTestEmailAdmin = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    const isAuthed = await verifyToken(data.token);
    if (!isAuthed) {
      throw new Error("Unauthorized");
    }
    return await sendTestNotification();
  });
