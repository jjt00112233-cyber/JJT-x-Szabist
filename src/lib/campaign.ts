import { queryOptions, useQuery } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { campaignConfig } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { SITE } from "./site";

export type CampaignConfig = {
  name: string;
  supporting: string;
  donationPhone: string;
  contactEmail: string;
  goal: number;
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
    }
  );
}
