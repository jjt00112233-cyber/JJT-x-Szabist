import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Phone,
  CheckCircle2,
  Mail,
  UploadCloud,
  X,
  FileCheck,
  Eye,
  Copy,
  Check,
  Building,
  CreditCard,
  Wallet,
} from "lucide-react";
import { submitDonationRequest } from "@/lib/donations";
import { uploadPaymentScreenshot } from "@/lib/upload";
import { PageHero } from "@/components/PageHero";
import { SITE, gmailComposeUrl, campaignConfigQuery, useCampaignConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/donate")({
  head: () => ({
    meta: [
      { title: "Donate | JJT × SZABIST Community" },
      { name: "description", content: "Contribute through JJT × SZABIST Community, supporting Junior Jinnah Trust. Your contact details stay private." },
      { property: "og:title", content: "Donate | JJT × SZABIST Community" },
      { property: "og:description", content: "Individuals, companies and foundations: support a child's education today." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.prefetchQuery(campaignConfigQuery),
  component: Donate,
});

const schema = z.object({
  full_name: z.string().trim().min(1, "Please enter your name").max(120),
  organization: z.string().trim().max(160).optional(),
  email: z.string().trim().email("Please enter a valid email").max(255),
  phone: z.string().trim().max(40).optional(),
  donor_type: z.enum(["individual", "foundation", "company"]),
  intended_amount: z.number().min(0).max(1_000_000_000).optional(),
  message: z.string().trim().max(1000).optional(),
});

const input = "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2.5 outline-none focus:border-ring focus:ring-2 focus:ring-ring/30";

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Copied ${label || text} to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy. Please select and copy manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={`Copy ${label || text}`}
      className="inline-flex items-center gap-1 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground px-2 py-1 text-[11px] font-medium transition cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          <span className="text-emerald-600 font-semibold">Copied</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>Copy</span>
        </>
      )}
    </button>
  );
}

function Donate() {
  const config = useCampaignConfig();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [confirmedProofUrl, setConfirmedProofUrl] = useState<string | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file is too large. Max allowed size is 10 MB.");
      return;
    }

    setScreenshotFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveFile() {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const amt = String(f.get("intended_amount") || "").trim();
    const parsed = schema.safeParse({
      full_name: f.get("full_name"),
      organization: String(f.get("organization") || "") || undefined,
      email: f.get("email"),
      phone: String(f.get("phone") || "") || undefined,
      donor_type: f.get("donor_type"),
      intended_amount: amt ? Number(amt) : undefined,
      message: String(f.get("message") || "") || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    setBusy(true);
    const d = parsed.data;

    let proofUrl: string | null = null;

    try {
      if (screenshotPreview) {
        setUploadStatus("Uploading payment receipt to secure CDN…");
        try {
          const uploadRes = await uploadPaymentScreenshot({
            data: {
              fileBase64: screenshotPreview,
              fileName: `payment_${d.full_name.replace(/\s+/g, "_")}_${Date.now()}`,
            },
          });
          proofUrl = uploadRes.url;
          setConfirmedProofUrl(proofUrl);
        } catch (uploadErr) {
          console.warn("Screenshot upload error:", uploadErr);
          toast.warning("Could not upload receipt image, but proceeding with submission.");
        }
      }

      setUploadStatus("Saving your submission…");
      await submitDonationRequest({
        data: {
          full_name: d.full_name,
          email: d.email,
          donor_type: d.donor_type,
          organization: d.organization ?? null,
          phone: d.phone ?? null,
          intended_amount: d.intended_amount ?? null,
          message: d.message ?? null,
          payment_proof_url: proofUrl,
        },
      });

      toast.success(
        proofUrl
          ? "Payment proof uploaded & donation submitted successfully!"
          : "Donation inquiry received! Thank you."
      );
      setDone(true);
    } catch (err) {
      console.error("Donation submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
      setUploadStatus("");
    }
  }

  return (
    <>
      <PageHero eyebrow="Donate" title="Give a child the gift of a classroom.">
        Individuals, companies and foundations are welcome. Share a few details and we'll give you the number to complete your donation.
      </PageHero>
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-10 sm:py-16">
        {done ? (
          <div className="animate-rise rounded-2xl border bg-card p-5 sm:p-10 text-center shadow-xl">
            <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold">Thank you for stepping forward.</h2>
            
            {confirmedProofUrl ? (
              <div className="mx-auto mt-6 max-w-md rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5 text-left">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <FileCheck className="h-5 w-5" /> Payment Receipt Attached
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  Your payment screenshot has been securely stored on CDN. Our team will verify the transfer with the bank and list your contribution on the public ledger.
                </p>
                <div className="mt-3 overflow-hidden rounded-lg border bg-background/90 p-2 text-center">
                  <img
                    src={confirmedProofUrl}
                    alt="Uploaded payment proof"
                    className="max-h-48 mx-auto rounded object-contain"
                  />
                  <a
                    href={confirmedProofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" /> View full receipt
                  </a>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm sm:text-base text-muted-foreground">
                Please call or WhatsApp this number to complete your donation:
              </p>
            )}

            <div className="mt-6">
              <a
                href={`tel:${config.donationPhone}`}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-primary px-6 py-3.5 sm:px-7 sm:py-4 font-serif text-xl sm:text-2xl font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
              >
                <Phone className="h-5 w-5 sm:h-6 sm:w-6" /> {config.donationPhone}
              </a>
            </div>

            {/* Quick reference of bank details on completed pledge screen */}
            <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-xs text-left space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Official Bank & Payment Information
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Bank Transfer</span>
                  <span className="font-semibold text-foreground block">{config.bankName}</span>
                  <span className="font-mono text-foreground block">A/C: {config.bankAccountNumber}</span>
                  <span className="font-mono text-muted-foreground text-[11px] block truncate">IBAN: {config.bankIban}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-muted-foreground block text-[10px] uppercase">Mobile Wallets</span>
                  <span className="font-semibold text-foreground block">EasyPaisa: {config.easypaisaNumber}</span>
                  <span className="font-semibold text-foreground block">JazzCash / SadaPay: {config.jazzcashNumber}</span>
                  <span className="text-muted-foreground text-[11px] block">Title: {config.easypaisaTitle || config.bankAccountTitle}</span>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs sm:text-sm text-muted-foreground">
              Every confirmed contribution is listed on our progress page.
            </p>
          </div>
        ) : (
          <>
            {/* Official Bank & Mobile Accounts Card */}
            <div className="mb-8 rounded-2xl border border-primary/20 bg-card p-5 sm:p-7 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" /> Official Payment & Bank Accounts
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Send your donation directly via Online Banking, EasyPaisa, JazzCash, or SadaPay.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Verified Accounts
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 mt-5">
                {/* Bank Transfer Box */}
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <CreditCard className="h-4 w-4" /> Bank Account (Online / Raast)
                    </span>
                    <span className="text-[11px] font-semibold text-foreground bg-background px-2 py-0.5 rounded border">
                      {config.bankName}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[11px]">Account Title</span>
                      <span className="font-bold text-foreground text-sm">{config.bankAccountTitle}</span>
                    </div>

                    <div className="flex items-center justify-between bg-background p-2 rounded-lg border">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Account Number</span>
                        <span className="font-mono font-bold text-foreground text-sm">{config.bankAccountNumber}</span>
                      </div>
                      <CopyButton text={config.bankAccountNumber} label="Account Number" />
                    </div>

                    <div className="flex items-center justify-between bg-background p-2 rounded-lg border">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">IBAN Number</span>
                        <span className="font-mono font-bold text-foreground text-xs block truncate">{config.bankIban}</span>
                      </div>
                      <CopyButton text={config.bankIban} label="IBAN Number" />
                    </div>
                  </div>
                </div>

                {/* Mobile Wallets Box */}
                <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Wallet className="h-4 w-4" /> Mobile Wallets (EasyPaisa & JazzCash)
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Instant Transfer
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between bg-background p-2 rounded-lg border">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          EasyPaisa ({config.easypaisaTitle || config.bankAccountTitle})
                        </span>
                        <span className="font-mono font-bold text-foreground text-sm">{config.easypaisaNumber}</span>
                      </div>
                      <CopyButton text={config.easypaisaNumber} label="EasyPaisa Number" />
                    </div>

                    <div className="flex items-center justify-between bg-background p-2 rounded-lg border">
                      <div>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                          JazzCash / SadaPay ({config.jazzcashTitle || config.bankAccountTitle})
                        </span>
                        <span className="font-mono font-bold text-foreground text-sm">{config.jazzcashNumber}</span>
                      </div>
                      <CopyButton text={config.jazzcashNumber} label="JazzCash Number" />
                    </div>

                    <div className="pt-1">
                      <span className="text-[11px] text-muted-foreground block">
                        {config.paymentInstructions || "Please upload a transfer screenshot below after sending for immediate verification."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4 sm:gap-5 rounded-2xl border bg-card p-5 sm:p-8 shadow-xl sm:grid-cols-2">
            <label className="text-sm font-medium sm:col-span-2">
              I am donating as
              <select name="donor_type" className={input} defaultValue="individual">
                <option value="individual">An individual</option>
                <option value="company">A company / sponsor</option>
                <option value="foundation">A foundation</option>
              </select>
            </label>
            <label className="text-sm font-medium">
              Full name *<input name="full_name" required maxLength={120} className={input} />
            </label>
            <label className="text-sm font-medium">
              Organisation<input name="organization" maxLength={160} className={input} />
            </label>
            <label className="text-sm font-medium">
              Email *<input name="email" type="email" required maxLength={255} className={input} />
            </label>
            <label className="text-sm font-medium">
              Phone<input name="phone" maxLength={40} className={input} />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Intended amount (Rs)<input name="intended_amount" type="number" min={0} className={input} />
            </label>
            <label className="text-sm font-medium sm:col-span-2">
              Message<textarea name="message" rows={3} maxLength={1000} className={input} />
            </label>

            {/* Payment Screenshot / Receipt Field */}
            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Payment Screenshot / Transfer Receipt{" "}
                  <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                </label>
                {screenshotPreview && (
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1 text-xs text-destructive hover:underline"
                  >
                    <X className="h-3.5 w-3.5" /> Remove receipt
                  </button>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                If you have already sent funds via Online Banking, EasyPaisa, JazzCash, or SadaPay/Nayapay (to <strong className="text-foreground font-semibold">{config.easypaisaNumber || config.donationPhone}</strong>), upload a screenshot here for fast verification.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px] text-muted-foreground">
                <span>Bank: <strong className="text-foreground">{config.bankName}</strong></span>
                <span>•</span>
                <span>A/C: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{config.bankAccountNumber}</code></span>
                <span>•</span>
                <span>IBAN: <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">{config.bankIban}</code></span>
              </div>

              {!screenshotPreview ? (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-input bg-muted/30 p-6 text-center transition hover:border-primary hover:bg-muted/50">
                  <UploadCloud className="h-8 w-8 text-primary mb-2 opacity-80" />
                  <span className="text-sm font-medium text-foreground">
                    Click or drag & drop payment screenshot
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG, WebP up to 10 MB (Stored securely on Cloud CDN)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl border bg-muted/30 p-4">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg border bg-background">
                    <img
                      src={screenshotPreview}
                      alt="Receipt preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                        <FileCheck className="h-3.5 w-3.5" /> Receipt Attached
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {screenshotFile ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : ""}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {screenshotFile?.name || "Payment receipt"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Will be uploaded to Cloudinary CDN and reviewed by JJT staff.
                    </p>
                  </div>
                  <label className="cursor-pointer shrink-0 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition">
                    Change file
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground sm:col-span-2">
              Your email and phone number stay private and are never displayed publicly. We use them only to contact you about your donation.
            </p>

            <Button
              type="submit"
              disabled={busy}
              className="h-auto rounded-lg py-3.5 font-medium sm:col-span-2"
            >
              {busy ? (uploadStatus || "Processing…") : "Submit Donation Inquiry"}
            </Button>
          </form>
          </>
        )}
        <div className="mt-10 rounded-xl bg-muted p-6 text-center text-sm">
          <p className="text-muted-foreground">Have a question before giving?</p>
          <a
            href={gmailComposeUrl(config.contactEmail)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 font-medium text-secondary hover:underline"
          >
            <Mail className="h-4 w-4" /> {config.contactEmail}
          </a>
        </div>
      </section>
    </>
  );
}
