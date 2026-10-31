import { describe, expect, it } from "vitest";
import { SUGGESTED_CONTRIBUTIONS, SITE, gmailComposeUrl, formatWhatsAppUrl, getWhatsAppUrl } from "@/lib/site";

describe("Suggested contributions", () => {
  it("starts suggestions at Rs 20,000 with none below that amount", () => {
    expect(SUGGESTED_CONTRIBUTIONS[0].amount).toBe(20000);
    expect(Math.min(...SUGGESTED_CONTRIBUTIONS.map((item) => item.amount))).toBe(20000);
  });
  it("increases each subsequent suggested contribution", () => {
    const amounts = SUGGESTED_CONTRIBUTIONS.map((item) => item.amount);
    amounts.slice(1).forEach((amount, index) => {
      const previous = amounts[index];
      if (previous === undefined) throw new Error("Missing preceding contribution amount");
      expect(amount).toBeGreaterThan(previous);
    });
  });
});

describe("Contact email and WhatsApp links", () => {
  it("opens Gmail compose addressed to the community contact", () => {
    const url = new URL(gmailComposeUrl());
    expect(url.origin).toBe("https://mail.google.com");
    expect(url.searchParams.get("view")).toBe("cm");
    expect(url.searchParams.get("to")).toBe(SITE.contactEmail);
  });

  it("formats WhatsApp URL correctly with international prefix", () => {
    expect(formatWhatsAppUrl("03219519360")).toBe("https://wa.me/923219519360");
    expect(formatWhatsAppUrl("+92-321-9519360")).toBe("https://wa.me/923219519360");
  });

  it("prioritizes custom WhatsApp URL when provided", () => {
    expect(getWhatsAppUrl("https://wa.link/custom123")).toBe("https://wa.link/custom123");
    expect(getWhatsAppUrl("", "03219519360")).toBe("https://wa.me/923219519360");
  });

  it("has default bank details and social links defined in shared SITE module", () => {
    expect(SITE.bankName).toBeDefined();
    expect(SITE.bankAccountNumber).toBeDefined();
    expect(SITE.bankIban).toBeDefined();
    expect(SITE.easypaisaNumber).toBeDefined();
    expect(SITE.facebookUrl).toBeDefined();
    expect(SITE.instagramUrl).toBeDefined();
    expect(SITE.linkedinUrl).toBeDefined();
    expect(SITE.whatsappUrl).toBeDefined();
  });
});