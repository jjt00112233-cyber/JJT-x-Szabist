import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import { db } from "@/lib/db";
import { contributions } from "../../drizzle/schema";
import { desc } from "drizzle-orm";

export type Contribution = {
  id: string;
  donor_label: string;
  amount: number;
  purpose: string | null;
  received_on: string;
};

export const getContributions = createServerFn({ method: "GET" }).handler(
  async (): Promise<Contribution[]> => {
    try {
      const rows = await db
        .select({
          id: contributions.id,
          donor_label: contributions.donor_label,
          amount: contributions.amount,
          purpose: contributions.purpose,
          received_on: contributions.received_on,
        })
        .from(contributions)
        .orderBy(desc(contributions.received_on));

      return rows.map((r) => ({
        ...r,
        amount: Number(r.amount),
      }));
    } catch (error) {
      console.error("Failed to load contributions from Neon DB:", error);
      return [];
    }
  }
);

export const contributionsQuery = queryOptions({
  queryKey: ["contributions"],
  queryFn: () => getContributions(),
});

export function summarize(rows: Contribution[]) {
  const total = rows.reduce((s, r) => s + r.amount, 0);
  return { total, supporters: rows.length };
}
