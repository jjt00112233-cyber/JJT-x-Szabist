import { queryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { campaignConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SITE, formatWhatsAppUrl } from "./site";

export type CampaignConfig = {
  name: string;
  supporting: string;
  donationPhone: string;
  contactEmail: string;
  goal: number;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  easypaisaNumber: string;
  easypaisaTitle: string;
  jazzcashNumber: string;
  jazzcashTitle: string;
  walletProviders: string;
  walletAccountNumber: string;
  walletAccountTitle: string;
  wallet2Providers?: string;
  wallet2AccountNumber?: string;
  wallet2AccountTitle?: string;
  paymentDisplayMode: "both" | "wallet_only" | "bank_only";
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  whatsappNumber: string;
  whatsappUrl: string;
  paymentInstructions: string;
  updatedAt?: string;
};

export const getCampaignConfig = createServerFn({ method: "GET" }).handler(
  async (): Promise<CampaignConfig> => {
    try {
      const rows = await db
        .select()
        .from(campaignConfig)
        .where(eq(campaignConfig.id, "default"))
        .limit(1);

      if (rows.length > 0 && rows[0]) {
        const row = rows[0];
        return {
          name: row.name || SITE.name,
          supporting: row.supporting || SITE.supporting,
          donationPhone: row.donation_phone || SITE.donationPhone,
          contactEmail: row.contact_email || SITE.contactEmail,
          goal: Number(row.goal) || SITE.goal,
          bankName: row.bank_name || SITE.bankName,
          bankAccountTitle: row.bank_account_title || SITE.bankAccountTitle,
          bankAccountNumber: row.bank_account_number || SITE.bankAccountNumber,
          bankIban: row.bank_iban || SITE.bankIban,
          easypaisaNumber: row.easypaisa_number || SITE.easypaisaNumber,
          easypaisaTitle: row.easypaisa_title || SITE.easypaisaTitle,
          jazzcashNumber: row.jazzcash_number || SITE.jazzcashNumber,
          jazzcashTitle: row.jazzcash_title || SITE.jazzcashTitle,
          walletProviders: row.wallet_providers || SITE.walletProviders,
          walletAccountNumber: row.wallet_account_number || row.easypaisa_number || SITE.walletAccountNumber,
          walletAccountTitle: row.wallet_account_title || row.easypaisa_title || SITE.walletAccountTitle,
          wallet2Providers: row.wallet2_providers || "",
          wallet2AccountNumber: row.wallet2_account_number || "",
          wallet2AccountTitle: row.wallet2_account_title || "",
          paymentDisplayMode: (row.payment_display_mode as "both" | "wallet_only" | "bank_only") || SITE.paymentDisplayMode,
          facebookUrl: row.facebook_url || SITE.facebookUrl,
          instagramUrl: row.instagram_url || SITE.instagramUrl,
          linkedinUrl: row.linkedin_url || SITE.linkedinUrl,
          whatsappNumber: row.whatsapp_number || row.donation_phone || SITE.whatsappNumber,
          whatsappUrl: row.whatsapp_url || formatWhatsAppUrl(row.whatsapp_number || row.donation_phone || SITE.whatsappNumber),
          paymentInstructions: row.payment_instructions || SITE.paymentInstructions,
          updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
        };
      }
    } catch (error) {
      console.error("Failed to load campaign config from Neon DB:", error);
    }

    return {
      name: SITE.name,
      supporting: SITE.supporting,
      donationPhone: SITE.donationPhone,
      contactEmail: SITE.contactEmail,
      goal: SITE.goal,
      bankName: SITE.bankName,
      bankAccountTitle: SITE.bankAccountTitle,
      bankAccountNumber: SITE.bankAccountNumber,
      bankIban: SITE.bankIban,
      easypaisaNumber: SITE.easypaisaNumber,
      easypaisaTitle: SITE.easypaisaTitle,
      jazzcashNumber: SITE.jazzcashNumber,
      jazzcashTitle: SITE.jazzcashTitle,
      walletProviders: SITE.walletProviders,
      walletAccountNumber: SITE.walletAccountNumber,
      walletAccountTitle: SITE.walletAccountTitle,
      wallet2Providers: SITE.wallet2Providers,
      wallet2AccountNumber: SITE.wallet2AccountNumber,
      wallet2AccountTitle: SITE.wallet2AccountTitle,
      paymentDisplayMode: SITE.paymentDisplayMode,
      facebookUrl: SITE.facebookUrl,
      instagramUrl: SITE.instagramUrl,
      linkedinUrl: SITE.linkedinUrl,
      whatsappNumber: SITE.whatsappNumber,
      whatsappUrl: formatWhatsAppUrl(SITE.whatsappNumber),
      paymentInstructions: SITE.paymentInstructions,
    };
  }
);

export const campaignConfigQuery = queryOptions({
  queryKey: ["campaign-config"],
  queryFn: () => getCampaignConfig(),
  staleTime: 1000 * 30,
});

export function useCampaignConfig(): CampaignConfig {
  const { data } = useQuery(campaignConfigQuery);
  return (
    data ?? {
      name: SITE.name,
      supporting: SITE.supporting,
      donationPhone: SITE.donationPhone,
      contactEmail: SITE.contactEmail,
      goal: SITE.goal,
      bankName: SITE.bankName,
      bankAccountTitle: SITE.bankAccountTitle,
      bankAccountNumber: SITE.bankAccountNumber,
      bankIban: SITE.bankIban,
      easypaisaNumber: SITE.easypaisaNumber,
      easypaisaTitle: SITE.easypaisaTitle,
      jazzcashNumber: SITE.jazzcashNumber,
      jazzcashTitle: SITE.jazzcashTitle,
      walletProviders: SITE.walletProviders,
      walletAccountNumber: SITE.walletAccountNumber,
      walletAccountTitle: SITE.walletAccountTitle,
      wallet2Providers: SITE.wallet2Providers,
      wallet2AccountNumber: SITE.wallet2AccountNumber,
      wallet2AccountTitle: SITE.wallet2AccountTitle,
      paymentDisplayMode: SITE.paymentDisplayMode,
      facebookUrl: SITE.facebookUrl,
      instagramUrl: SITE.instagramUrl,
      linkedinUrl: SITE.linkedinUrl,
      whatsappNumber: SITE.whatsappNumber,
      whatsappUrl: formatWhatsAppUrl(SITE.whatsappNumber),
      paymentInstructions: SITE.paymentInstructions,
    }
  );
}
