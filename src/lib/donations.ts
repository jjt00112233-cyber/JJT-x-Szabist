import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { donationRequests } from "../../drizzle/schema";
import { sendNotificationForSubmission } from "@/lib/email";

export type DonationInput = {
  full_name: string;
  email: string;
  donor_type: "individual" | "foundation" | "company" | "contact" | string;
  organization?: string | null;
  phone?: string | null;
  intended_amount?: number | null;
  message?: string | null;
  payment_proof_url?: string | null;
};

export const submitDonationRequest = createServerFn({ method: "POST" })
  .validator((data: DonationInput) => data)
  .handler(async ({ data }) => {
    const [inserted] = await db
      .insert(donationRequests)
      .values({
        full_name: data.full_name,
        email: data.email,
        donor_type: data.donor_type,
        organization: data.organization ?? null,
        phone: data.phone ?? null,
        intended_amount: data.intended_amount != null ? String(data.intended_amount) : null,
        message: data.message ?? null,
        payment_proof_url: data.payment_proof_url ?? null,
      })
      .returning({ id: donationRequests.id });

    // Send asynchronous email notification to admin via Resend
    // Wrapped in try/catch so any mail dispatch failure never interrupts or fails the user submission
    try {
      await sendNotificationForSubmission(data);
    } catch (emailErr) {
      console.error("[Email Notification Error in submitDonationRequest]", emailErr);
    }

    return { success: true, id: inserted?.id };
  });
