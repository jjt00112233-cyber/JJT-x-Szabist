/**
 * Resend Email Notification Service
 * Sends automated real-time alert emails to campaign administrators
 * whenever a donation, pledge, or inquiry is submitted.
 */

import { SITE } from "@/lib/site";

export interface DonationSubmissionData {
  full_name: string;
  email: string;
  donor_type?: string | null;
  organization?: string | null;
  phone?: string | null;
  intended_amount?: number | string | null;
  message?: string | null;
  payment_proof_url?: string | null;
}

export interface EmailSendResult {
  success: boolean;
  id?: string;
  error?: string;
  skipped?: boolean;
}

/**
 * Returns the destination email address for admin alerts.
 * Defaults to jjt00112233@gmail.com if NOTIFICATION_EMAIL is not explicitly overridden.
 */
export function getNotificationEmail(): string {
  return (process.env.NOTIFICATION_EMAIL || "jjt00112233@gmail.com").trim();
}

/**
 * Returns the configured Resend API key or undefined.
 */
export function getResendApiKey(): string | undefined {
  const key = process.env.RESEND_API_KEY?.trim();
  return key && key.length > 0 ? key : undefined;
}

/**
 * Returns the sender email address.
 * Resend free accounts allow sending from "onboarding@resend.dev" by default,
 * or any custom verified domain configured via RESEND_FROM_EMAIL.
 */
export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "JJT Platform <onboarding@resend.dev>"
  );
}

/**
 * Low-level email dispatcher using Resend's REST API.
 * Uses native fetch for zero-dependency execution across Node, Vercel, and Cloudflare.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  reply_to,
}: {
  to?: string;
  subject: string;
  html: string;
  text: string;
  reply_to?: string;
}): Promise<EmailSendResult> {
  const apiKey = getResendApiKey();
  const recipient = to || getNotificationEmail();
  const from = getResendFromEmail();

  if (!apiKey) {
    console.warn(
      `[Resend Email] Skipped sending "${subject}" to ${recipient} because RESEND_API_KEY is not configured.`
    );
    return {
      success: false,
      skipped: true,
      error: "RESEND_API_KEY environment variable is not configured.",
    };
  }

  try {
    const payload: Record<string, unknown> = {
      from,
      to: [recipient],
      subject,
      html,
      text,
    };

    if (reply_to && reply_to.trim().length > 0) {
      payload.reply_to = reply_to.trim();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const raw = await response.text();
    let body: any = {};
    try {
      body = JSON.parse(raw);
    } catch {
      body = { raw };
    }

    if (!response.ok) {
      const errMsg = body?.message || body?.error || `HTTP ${response.status}: ${raw}`;
      console.error(`[Resend Email Failed] Status ${response.status}: ${errMsg}`);
      return {
        success: false,
        error: errMsg,
      };
    }

    console.log(
      `[Resend Email Sent] Successfully sent "${subject}" to ${recipient} (ID: ${body?.id})`
    );
    return {
      success: true,
      id: body?.id,
    };
  } catch (err: any) {
    const message = err?.name === "AbortError" ? "Request timed out after 12s" : err?.message || String(err);
    console.error("[Resend Email Exception]", message);
    return {
      success: false,
      error: message,
    };
  }
}

/**
 * Formats a currency amount into readable PKR text.
 */
function formatAmount(amount: number | string | null | undefined): string {
  if (amount == null || amount === "") return "Unspecified Amount";
  const num = typeof amount === "number" ? amount : parseFloat(String(amount));
  if (Number.isNaN(num)) return String(amount);
  return `Rs. ${num.toLocaleString("en-PK")}`;
}

/**
 * Escapes HTML characters to prevent XSS / broken formatting in emails.
 */
function escapeHtml(str: string | null | undefined): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Sends an email alert for a newly received donation or pledge.
 */
export async function sendDonationNotification(
  data: DonationSubmissionData
): Promise<EmailSendResult> {
  const recipient = getNotificationEmail();
  const amountStr = formatAmount(data.intended_amount);
  const subject = `💰 New Donation Alert: ${amountStr} from ${data.full_name || "Anonymous"}`;

  const donorTypeLabel =
    data.donor_type === "foundation"
      ? "Foundation / Trust"
      : data.donor_type === "company"
      ? "Corporate / Company"
      : "Individual Donor";

  const hasProof = Boolean(data.payment_proof_url && data.payment_proof_url.trim().length > 0);

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 28px 24px; text-align: center; color: #ffffff;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #a7f3d0;">
        Junior Jinnah Trust × SZABIST
      </p>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">
        🎉 New Donation Received
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #ecfdf5;">
        A new donor submission was recorded through the platform.
      </p>
    </div>

    <!-- Amount Hero Highlight -->
    <div style="padding: 24px 24px 16px 24px;">
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 18px; text-align: center;">
        <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #15803d; margin-bottom: 4px;">
          Intended Donation Amount
        </span>
        <span style="display: block; font-size: 30px; font-weight: 800; color: #047857; letter-spacing: -0.5px;">
          ${escapeHtml(amountStr)}
        </span>
        ${
          hasProof
            ? `<span style="display: inline-block; margin-top: 8px; background: #059669; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">
                ✓ Payment Proof Uploaded
              </span>`
            : `<span style="display: inline-block; margin-top: 8px; background: #fef3c7; color: #92400e; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 9999px;">
                Pledge (Awaiting Transfer)
              </span>`
        }
      </div>
    </div>

    <!-- Details Section -->
    <div style="padding: 0 24px 20px 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 38%;">Donor Name</td>
          <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${escapeHtml(data.full_name)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Donor Category</td>
          <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(donorTypeLabel)}</td>
        </tr>
        ${
          data.organization
            ? `<tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Organization</td>
                <td style="padding: 10px 0; color: #0f172a;">${escapeHtml(data.organization)}</td>
              </tr>`
            : ""
        }
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Email Address</td>
          <td style="padding: 10px 0;">
            <a href="mailto:${escapeHtml(data.email)}" style="color: #059669; font-weight: 600; text-decoration: none;">
              ${escapeHtml(data.email)}
            </a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Phone Number</td>
          <td style="padding: 10px 0;">
            ${
              data.phone
                ? `<a href="tel:${escapeHtml(data.phone)}" style="color: #059669; font-weight: 600; text-decoration: none;">
                    ${escapeHtml(data.phone)}
                  </a>`
                : `<span style="color: #94a3b8;">Not provided</span>`
            }
          </td>
        </tr>
      </table>

      <!-- Donor Message Note -->
      ${
        data.message
          ? `<div style="margin-top: 18px; padding: 14px 16px; background: #f8fafc; border-left: 4px solid #059669; border-radius: 4px;">
              <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b;">
                Donor Note / Dedication:
              </p>
              <p style="margin: 0; font-size: 13px; font-style: italic; color: #334155; line-height: 1.5;">
                "${escapeHtml(data.message)}"
              </p>
            </div>`
          : ""
      }

      <!-- Payment Proof Preview -->
      ${
        hasProof
          ? `<div style="margin-top: 20px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #047857;">
                Payment Receipt Attached
              </p>
              <a href="${escapeHtml(data.payment_proof_url)}" target="_blank" rel="noopener noreferrer">
                <img src="${escapeHtml(data.payment_proof_url)}" alt="Payment Receipt" style="max-width: 100%; max-height: 340px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block; object-fit: contain;" />
              </a>
              <div style="margin-top: 10px;">
                <a href="${escapeHtml(data.payment_proof_url)}" target="_blank" rel="noopener noreferrer" style="display: inline-block; font-size: 12px; font-weight: 700; color: #059669; text-decoration: underline;">
                  Open Full Resolution Receipt ↗
                </a>
              </div>
            </div>`
          : ""
      }

      <!-- Admin Direct Link CTA -->
      <div style="margin-top: 24px; text-align: center;">
        <p style="font-size: 12px; color: #64748b; margin-bottom: 12px;">
          You can confirm receipt, credit this to the campaign progress bar, or manage all inquiries in the admin portal.
        </p>
        <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent("Thank you for supporting Junior Jinnah Trust")}" style="display: inline-block; background: #059669; color: #ffffff; padding: 11px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(5,150,105,0.25);">
          ✉ Reply Directly to Donor
        </a>
      </div>

    </div>

    <!-- Email Footer -->
    <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
      <p style="margin: 0;">
        Delivered to <strong style="color: #64748b;">${escapeHtml(recipient)}</strong> for the JJT × SZABIST Fundraising Initiative.
      </p>
      <p style="margin: 4px 0 0 0;">
        Official Hotline: ${escapeHtml(SITE.donationPhone)} • Email: ${escapeHtml(SITE.contactEmail)}
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
[NEW DONATION RECEIVED - JJT x SZABIST]

Amount: ${amountStr}
Donor Name: ${data.full_name}
Category: ${donorTypeLabel}
${data.organization ? `Organization: ${data.organization}\n` : ""}Email: ${data.email}
Phone: ${data.phone || "Not provided"}
${data.message ? `\nMessage: "${data.message}"\n` : ""}${hasProof ? `Payment Receipt: ${data.payment_proof_url}\n` : ""}
Recipient: ${recipient}
  `.trim();

  return await sendEmail({
    to: recipient,
    subject,
    html,
    text,
    reply_to: data.email,
  });
}

/**
 * Sends an email alert for a newly received contact form inquiry.
 */
export async function sendInquiryNotification(
  data: DonationSubmissionData
): Promise<EmailSendResult> {
  const recipient = getNotificationEmail();
  const subject = `📬 New Inquiry from ${data.full_name || "Visitor"} - JJT x SZABIST`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
  <div style="max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
    
    <!-- Top Header Banner -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 26px 24px; text-align: center; color: #ffffff;">
      <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #bfdbfe;">
        Junior Jinnah Trust × SZABIST
      </p>
      <h1 style="margin: 0; font-size: 22px; font-weight: 800; line-height: 1.3;">
        📬 New Contact Form Inquiry
      </h1>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #dbeafe;">
        A new visitor sent a message through the /contact page.
      </p>
    </div>

    <!-- Message Content Box -->
    <div style="padding: 24px 24px 12px 24px;">
      <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 12px; padding: 18px;">
        <span style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin-bottom: 8px;">
          Inquiry Message:
        </span>
        <p style="margin: 0; font-size: 14px; color: #1e293b; line-height: 1.6; white-space: pre-wrap;">
${escapeHtml(data.message || "(No message body provided)")}
        </p>
      </div>
    </div>

    <!-- Sender Details Table -->
    <div style="padding: 0 24px 20px 24px;">
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b; width: 38%;">Sender Name</td>
          <td style="padding: 10px 0; font-weight: 700; color: #0f172a;">${escapeHtml(data.full_name)}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Email Address</td>
          <td style="padding: 10px 0;">
            <a href="mailto:${escapeHtml(data.email)}" style="color: #2563eb; font-weight: 600; text-decoration: none;">
              ${escapeHtml(data.email)}
            </a>
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: 600; color: #64748b;">Phone Number</td>
          <td style="padding: 10px 0;">
            ${
              data.phone
                ? `<a href="tel:${escapeHtml(data.phone)}" style="color: #2563eb; font-weight: 600; text-decoration: none;">
                    ${escapeHtml(data.phone)}
                  </a>`
                : `<span style="color: #94a3b8;">Not provided</span>`
            }
          </td>
        </tr>
      </table>

      <!-- Quick Action CTA -->
      <div style="margin-top: 24px; text-align: center;">
        <a href="mailto:${escapeHtml(data.email)}?subject=${encodeURIComponent("Re: Inquiry - Junior Jinnah Trust x SZABIST")}" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 11px 22px; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 8px; box-shadow: 0 2px 4px rgba(37,99,235,0.25);">
          ✉ Reply to ${escapeHtml(data.full_name || "Sender")}
        </a>
      </div>
    </div>

    <!-- Email Footer -->
    <div style="background: #f8fafc; padding: 16px 24px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.5;">
      <p style="margin: 0;">
        Delivered to <strong style="color: #64748b;">${escapeHtml(recipient)}</strong> for the JJT × SZABIST Fundraising Initiative.
      </p>
      <p style="margin: 4px 0 0 0;">
        Official Hotline: ${escapeHtml(SITE.donationPhone)} • Email: ${escapeHtml(SITE.contactEmail)}
      </p>
    </div>

  </div>
</body>
</html>
  `.trim();

  const text = `
[NEW CONTACT INQUIRY - JJT x SZABIST]

From: ${data.full_name}
Email: ${data.email}
Phone: ${data.phone || "Not provided"}

Message:
${data.message || "(No message body provided)"}

Delivered to: ${recipient}
  `.trim();

  return await sendEmail({
    to: recipient,
    subject,
    html,
    text,
    reply_to: data.email,
  });
}

/**
 * Intelligent dispatcher: checks if submission is a contact inquiry or a donation pledge,
 * and sends the appropriate email alert.
 */
export async function sendNotificationForSubmission(
  data: DonationSubmissionData
): Promise<EmailSendResult> {
  if (data.donor_type === "contact") {
    return await sendInquiryNotification(data);
  }
  return await sendDonationNotification(data);
}

/**
 * Sends a test verification email to confirm that Resend credentials and delivery work.
 */
export async function sendTestNotification(): Promise<EmailSendResult> {
  const recipient = getNotificationEmail();
  const subject = `✅ Resend Email Integration Verified - JJT x SZABIST`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a;">
  <div style="max-width: 580px; margin: 30px auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
    <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 24px; text-align: center; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 800;">✓ Email Notifications Active!</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #ecfdf5;">Resend API Integration is Connected</p>
    </div>
    <div style="padding: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
      <p style="margin-top: 0;">
        Hello Administrator,
      </p>
      <p>
        This test confirms that your <strong>Resend API</strong> setup is fully functional. Whenever a donor makes a contribution or a visitor submits an inquiry on the <strong>JJT × SZABIST</strong> platform, real-time alerts will arrive directly in this inbox:
      </p>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-weight: 600; color: #047857;">
        📧 ${escapeHtml(recipient)}
      </div>
      <p style="margin-bottom: 0; font-size: 12px; color: #64748b;">
        Test timestamp: ${new Date().toISOString()}
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Resend Email Integration Verified!

Your Resend API integration is fully functional and delivering to: ${recipient}
Timestamp: ${new Date().toISOString()}
  `.trim();

  return await sendEmail({
    to: recipient,
    subject,
    html,
    text,
  });
}
