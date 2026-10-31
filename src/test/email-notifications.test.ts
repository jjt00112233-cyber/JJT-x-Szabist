import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getNotificationEmail,
  getResendApiKey,
  getResendFromEmail,
  sendEmail,
  sendDonationNotification,
  sendInquiryNotification,
  sendNotificationForSubmission,
  sendTestNotification,
} from "@/lib/email";

describe("Resend Email Notification Service", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("defaults recipient email to jjt00112233@gmail.com", () => {
    delete process.env.NOTIFICATION_EMAIL;
    expect(getNotificationEmail()).toBe("jjt00112233@gmail.com");

    process.env.NOTIFICATION_EMAIL = "custom@example.com";
    expect(getNotificationEmail()).toBe("custom@example.com");
  });

  it("retrieves Resend API key and sender email correctly", () => {
    delete process.env.RESEND_API_KEY;
    expect(getResendApiKey()).toBeUndefined();

    process.env.RESEND_API_KEY = "re_test_123456789";
    expect(getResendApiKey()).toBe("re_test_123456789");

    expect(getResendFromEmail()).toBe("JJT Platform <onboarding@resend.dev>");
    process.env.RESEND_FROM_EMAIL = "noreply@customdomain.org";
    expect(getResendFromEmail()).toBe("noreply@customdomain.org");
  });

  it("gracefully skips sending when RESEND_API_KEY is not configured", async () => {
    delete process.env.RESEND_API_KEY;

    const result = await sendEmail({
      subject: "Test Subject",
      html: "<p>Hello</p>",
      text: "Hello",
    });

    expect(result.success).toBe(false);
    expect(result.skipped).toBe(true);
    expect(result.error).toContain("RESEND_API_KEY");
  });

  it("sends donation email with correct headers and payload to jjt00112233@gmail.com", async () => {
    process.env.RESEND_API_KEY = "re_test_key_valid";
    process.env.NOTIFICATION_EMAIL = "jjt00112233@gmail.com";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_don_123" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await sendDonationNotification({
      full_name: "Ahmed Ali",
      email: "ahmed@example.com",
      donor_type: "individual",
      intended_amount: 25000,
      phone: "03001234567",
      message: "May this help educate children.",
      payment_proof_url: "https://res.cloudinary.com/test/image.png",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("msg_don_123");
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const [url, options] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options?.method).toBe("POST");

    const headers = options?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer re_test_key_valid");

    const body = JSON.parse(options?.body as string);
    expect(body.to).toEqual(["jjt00112233@gmail.com"]);
    expect(body.reply_to).toBe("ahmed@example.com");
    expect(body.subject).toContain("Rs. 25,000");
    expect(body.subject).toContain("Ahmed Ali");
    expect(body.html).toContain("25,000");
    expect(body.html).toContain("Ahmed Ali");
    expect(body.html).toContain("https://res.cloudinary.com/test/image.png");
    expect(body.html).toContain("May this help educate children.");
  });

  it("sends inquiry email with correct subject and body to jjt00112233@gmail.com", async () => {
    process.env.RESEND_API_KEY = "re_test_key_valid";
    process.env.NOTIFICATION_EMAIL = "jjt00112233@gmail.com";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ id: "msg_inq_456" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await sendInquiryNotification({
      full_name: "Sara Khan",
      email: "sara@szabist.edu.pk",
      donor_type: "contact",
      phone: "03339876543",
      message: "I would like to volunteer for the campus fundraiser drive.",
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe("msg_inq_456");

    const [, options] = fetchSpy.mock.calls[0];
    const body = JSON.parse(options?.body as string);
    expect(body.to).toEqual(["jjt00112233@gmail.com"]);
    expect(body.reply_to).toBe("sara@szabist.edu.pk");
    expect(body.subject).toContain("Sara Khan");
    expect(body.html).toContain("Sara Khan");
    expect(body.html).toContain("volunteer for the campus fundraiser drive");
  });

  it("intelligently routes contact submissions vs donation submissions", async () => {
    process.env.RESEND_API_KEY = "re_test_key_valid";

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ id: "msg_dyn" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      )
    );

    // 1. Contact inquiry
    await sendNotificationForSubmission({
      full_name: "Inquiry User",
      email: "visitor@example.com",
      donor_type: "contact",
      message: "Help needed",
    });

    const call1Body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(call1Body.subject).toContain("New Inquiry");

    // 2. Donation pledge
    await sendNotificationForSubmission({
      full_name: "Generous Donor",
      email: "donor@example.com",
      donor_type: "company",
      intended_amount: 100000,
    });

    const call2Body = JSON.parse(fetchSpy.mock.calls[1][1]?.body as string);
    expect(call2Body.subject).toContain("New Donation Alert");
  });

  it("handles Resend API error responses gracefully without throwing", async () => {
    process.env.RESEND_API_KEY = "re_invalid_or_forbidden";

    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "Invalid API Key" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );

    const result = await sendTestNotification();
    expect(result.success).toBe(false);
    expect(result.error).toContain("Invalid API Key");
  });

  it("handles network failure or timeout cleanly", async () => {
    process.env.RESEND_API_KEY = "re_test_key_valid";

    vi.spyOn(globalThis, "fetch").mockRejectedValueOnce(
      new Error("DNS lookup failed for api.resend.com")
    );

    const result = await sendTestNotification();
    expect(result.success).toBe(false);
    expect(result.error).toContain("DNS lookup failed");
  });
});
