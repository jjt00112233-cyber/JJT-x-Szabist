import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { submitDonationRequest } from "@/lib/donations";
import { Button } from "@/components/ui/button";
import { useCampaignConfig, formatWhatsAppUrl, getWhatsAppUrl, gmailComposeUrl, SITE } from "@/lib/site";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | JJT × SZABIST Community" },
      {
        name: "description",
        content:
          "Get in touch with Junior Jinnah Trust and the JJT × SZABIST Community team. Visit our Islamabad head office, call us, or send an inquiry.",
      },
      { property: "og:title", content: "Contact Us | JJT × SZABIST Community" },
      {
        property: "og:description",
        content:
          "Official contact details, office address, opening hours, and contact form for Junior Jinnah Trust.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

// SVG Icons for social platforms
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
    </svg>
  );
}

function ContactPage() {
  const config = useCampaignConfig();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!firstName.trim()) {
      toast.error("Please enter your first name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setBusy(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await submitDonationRequest({
        data: {
          full_name: fullName,
          email: email.trim(),
          phone: phone.trim(),
          donor_type: "contact",
          message: message.trim() || "Contact page message",
        },
      });

      setSubmitted(true);
      toast.success("Thank you! Your message has been sent successfully.");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Failed to send message. Please try again or reach us via WhatsApp.");
    } finally {
      setBusy(false);
    }
  }

  function handleReset() {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setMessage("");
    setSubmitted(false);
  }

  return (
    <>
      <PageHero
        eyebrow="Contact Us"
        title="We'd love to hear from you."
        backgroundImage="/jjt-banner.jpg"
        imagePosition="center"
      >
        Have questions about Junior Jinnah Trust, our educational initiatives, or how you can participate? Reach out through our direct office channels or submit the message form below.
      </PageHero>

      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Column: Official Contact Details & Hours (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Official Head Office
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                Junior Jinnah Trust
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Registered non-profit under Trust Act 1882 serving Pakistan's underprivileged children with free education.
              </p>
            </div>

            {/* Address Card */}
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-3 transition hover:shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase font-semibold text-muted-foreground">Address</p>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    1st Floor, Al-Rehman Plaza, Plot-4, Street # 2, Gouri VIP phase Express Way, Islamabad, Pakistan
                  </p>
                  <div className="pt-2">
                    <a
                      href="https://www.google.com/maps/dir//Junior+Jinnah+Trust+(Head+Office),+Roshan+Arcade,+Main,+Lehtrar+Rd,+Ali+Pur,+Islamabad,+Islamabad+Capital+Territory+44000/@33.6452784,73.1157764,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x38dfe9ef30146281:0x225d10758e0a8ce2!2m2!1d73.1858165!2d33.6452981"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>Get Directions on Google Maps</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-3 transition hover:shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="space-y-1 w-full">
                  <p className="text-xs uppercase font-semibold text-muted-foreground">Phone & WhatsApp</p>
                  <div className="space-y-1.5 pt-1">
                    <a
                      href={getWhatsAppUrl(config.whatsappUrl, config.donationPhone)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition"
                    >
                      <span>{config.donationPhone}</span>
                      <span className="text-[11px] text-emerald-600 font-medium">WhatsApp</span>
                    </a>
                    <a
                      href={`tel:${config.donationPhone}`}
                      className="flex items-center justify-between text-sm font-semibold text-foreground hover:text-primary transition"
                    >
                      <span>{config.donationPhone}</span>
                      <span className="text-[11px] text-muted-foreground font-medium">Direct Line</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-3 transition hover:shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase font-semibold text-muted-foreground">Official Email</p>
                  <a
                    href={`mailto:${config.contactEmail}`}
                    className="block text-sm font-semibold text-foreground hover:text-primary transition"
                  >
                    {config.contactEmail}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    General inquiries, verification & partnership queries
                  </p>
                  <div className="pt-1">
                    <a
                      href={gmailComposeUrl(config.contactEmail)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                    >
                      Open Gmail Composer ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Hours Card */}
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-3 transition hover:shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs uppercase font-semibold text-muted-foreground">Our Hours</p>
                  <p className="text-sm font-bold text-foreground">09:00 AM – 16:00 PM</p>
                  <p className="text-xs text-muted-foreground">Monday – Friday (PKT)</p>
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="rounded-2xl border bg-card p-5 sm:p-6 shadow-xs space-y-3">
              <p className="text-xs uppercase font-semibold text-muted-foreground">Connect with Us</p>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={config.facebookUrl || SITE.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition"
                >
                  <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
                  <span>Facebook</span>
                </a>
                <a
                  href={getWhatsAppUrl(config.whatsappUrl, config.donationPhone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition"
                >
                  <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={config.instagramUrl || SITE.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition"
                >
                  <InstagramIcon className="h-4 w-4 text-[#E4405F]" />
                  <span>Instagram</span>
                </a>
                <a
                  href={config.linkedinUrl || SITE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border bg-muted/40 px-3.5 py-2 text-xs font-semibold text-foreground hover:border-primary hover:bg-primary/10 hover:text-primary transition"
                >
                  <LinkedInIcon className="h-4 w-4 text-[#0A66C2]" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border bg-card p-6 sm:p-8 md:p-10 shadow-lg">
              {submitted ? (
                <div className="py-8 text-center space-y-4 animate-rise">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    Message Sent Successfully!
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
                    Thank you for reaching out to Junior Jinnah Trust. Our team has received your message and will respond to you shortly via email or phone.
                  </p>
                  <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                    <Button onClick={handleReset} variant="outline">
                      Send Another Message
                    </Button>
                    <Button asChild className="bg-primary text-primary-foreground">
                      <a href={getWhatsAppUrl(config.whatsappUrl, config.donationPhone)} target="_blank" rel="noopener noreferrer">
                        Chat on WhatsApp
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b pb-4 mb-6">
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                      Contact Form
                    </h2>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Leave your details and question below. Our trust coordinators will follow up promptly.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                    {/* Name: First & Last */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
                        Name *
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <input
                            type="text"
                            required
                            placeholder="First Name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <span className="text-[11px] text-muted-foreground mt-1 block">First</span>
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Last Name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                          />
                          <span className="text-[11px] text-muted-foreground mt-1 block">Last</span>
                        </div>
                      </div>
                    </div>

                    {/* Phone * */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
                        Phone *
                      </label>
                      <div className="relative">
                        <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="tel"
                          required
                          placeholder="+92 3XX XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Email * */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
                        Email *
                      </label>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-lg border border-input bg-background pl-10 pr-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                    </div>

                    {/* Comment or Message */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-foreground mb-1.5">
                        Comment or Message
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Tell us about your inquiry, donation pledge, or how you'd like to collaborate..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <Button
                        type="submit"
                        disabled={busy}
                        className="w-full sm:w-auto px-8 py-3 text-base font-semibold shadow-md gap-2"
                      >
                        {busy ? (
                          <>Sending Message...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4" /> Submit
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
