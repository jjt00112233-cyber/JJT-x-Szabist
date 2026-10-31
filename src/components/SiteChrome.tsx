import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Menu,
  X,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Heart,
  ChevronRight,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { SITE, gmailComposeUrl, useCampaignConfig } from "@/lib/site";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About JJT" },
  { to: "/impact", label: "Where Funds Go" },
  { to: "/progress", label: "Live Progress" },
  { to: "/contact", label: "Contact Us" },
] as const;

export function SiteHeader() {
  const config = useCampaignConfig();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    }

    // Run once on mount in case page is already scrolled
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-deep-foreground/10 bg-deep/95 text-deep-foreground shadow-lg backdrop-blur-md py-3 sm:py-3.5"
          : "bg-transparent border-b border-transparent text-deep-foreground py-4 sm:py-5"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Tag */}
        <Link to="/" className="group flex items-center gap-2.5 sm:gap-3 min-w-0">
          <img
            src="/logo.png"
            alt={config.name}
            className={`h-9 w-9 sm:h-11 sm:w-11 shrink-0 rounded-full object-cover border-2 transition-all duration-300 ${
              scrolled
                ? "border-primary/60 shadow-xs"
                : "border-primary shadow-md ring-2 ring-primary/30"
            }`}
          />
          <div className="min-w-0">
            <span className="block font-serif text-base sm:text-lg font-bold leading-tight tracking-tight text-deep-foreground group-hover:text-primary transition-colors truncate">
              {config.name}
            </span>
            <span className="block text-[10px] sm:text-xs font-medium text-deep-foreground/75 truncate">
              {config.supporting}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="relative font-medium text-deep-foreground/80 hover:text-deep-foreground transition-colors py-1 group"
              activeProps={{ className: "text-primary font-semibold" }}
              activeOptions={{ exact: true }}
            >
              <span>{n.label}</span>
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full group-[.text-primary]:w-full rounded-full" />
            </Link>
          ))}

          {/* Call-to-action Button */}
          <Button
            asChild
            className="rounded-xl px-5 py-2.5 font-medium shadow-md transition-all hover:shadow-primary/20 hover:scale-[1.02]"
          >
            <Link to="/donate" className="flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-current" />
              <span>Donate</span>
            </Link>
          </Button>
        </nav>

        {/* Mobile Hamburger Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-deep-foreground hover:bg-deep-foreground/10 md:hidden h-9 w-9"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Drawer Menu */}
      {open && (
        <div className="border-t border-deep-foreground/10 bg-deep/98 px-5 py-5 backdrop-blur-xl md:hidden animate-rise max-h-[calc(100vh-4.5rem)] overflow-y-auto">
          <nav className="flex flex-col space-y-2.5">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-lg px-3.5 py-2.5 text-base font-medium text-deep-foreground/90 hover:bg-deep-foreground/10 transition"
                activeProps={{ className: "bg-primary/15 text-primary font-semibold" }}
                activeOptions={{ exact: true }}
              >
                <span>{n.label}</span>
                <ChevronRight className="h-4 w-4 text-deep-foreground/50" />
              </Link>
            ))}
            <div className="pt-2">
              <Link
                to="/donate"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-center font-medium text-primary-foreground shadow-md transition"
              >
                <Heart className="h-4 w-4 fill-current" />
                <span>Contribute to the Fund</span>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

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

export function SiteFooter() {
  const config = useCampaignConfig();
  return (
    <footer className="border-t border-deep-foreground/10 bg-deep text-deep-foreground">
      {/* Top Main Footer Grid */}
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Organization & Mission */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt={config.name}
                className="h-11 w-11 shrink-0 rounded-full object-cover border-2 border-primary/50 shadow-xs"
              />
              <div>
                <p className="font-serif text-lg font-bold leading-tight">{config.name}</p>
                <p className="text-xs text-deep-foreground/70">{config.supporting}</p>
              </div>
            </div>

            <p className="text-sm text-deep-foreground/80 leading-relaxed">
              A community initiative by SZABIST Islamabad students supporting Junior Jinnah Trust to bring quality education, school meals, and clean water to underprivileged children.
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg bg-deep-foreground/10 px-3 py-1.5 text-xs text-deep-foreground/90">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>Trust Act 1882 • FBR Registered</span>
            </div>

            {/* Social Links */}
            <div className="pt-2 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Follow Junior Jinnah Trust
              </p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.facebook.com/thejuniorjinnahtrust"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Junior Jinnah Trust Facebook"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-foreground/10 text-deep-foreground hover:bg-[#1877F2] hover:text-white transition shadow-xs"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://wa.link/tue7xa"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-foreground/10 text-deep-foreground hover:bg-[#25D366] hover:text-white transition shadow-xs"
                >
                  <WhatsAppIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.instagram.com/jinnahjuniortrust/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Junior Jinnah Trust Instagram"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-foreground/10 text-deep-foreground hover:bg-[#E4405F] hover:text-white transition shadow-xs"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>
                <a
                  href="https://www.linkedin.com/company/54089173/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Junior Jinnah Trust LinkedIn"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-deep-foreground/10 text-deep-foreground hover:bg-[#0A66C2] hover:text-white transition shadow-xs"
                >
                  <LinkedInIcon className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="space-y-4">
            <p className="font-serif text-base font-semibold tracking-wide text-primary">
              Campaign Links
            </p>
            <ul className="space-y-2.5 text-sm text-deep-foreground/80">
              <li>
                <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> About Junior Jinnah Trust
                </Link>
              </li>
              <li>
                <Link to="/impact" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> Where Funds Go
                </Link>
              </li>
              <li>
                <Link to="/progress" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> Public Contributions Ledger
                </Link>
              </li>
              <li>
                <Link to="/donate" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> Make a Donation
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  <ChevronRight className="h-3.5 w-3.5 text-primary" /> Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Impact Pillars */}
          <div className="space-y-4">
            <p className="font-serif text-base font-semibold tracking-wide text-primary">
              What Your Gift Supports
            </p>
            <ul className="space-y-2.5 text-sm text-deep-foreground/80">
              <li className="flex items-start gap-2">
                <GraduationCap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Textbooks, uniforms & stationery</span>
              </li>
              <li className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Daily school meals & clean drinking water</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Teacher support & classroom facilities</span>
              </li>
              <li className="flex items-start gap-2">
                <Heart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <span>Rescuing child laborers from streets</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Verification */}
          <div className="space-y-4">
            <p className="font-serif text-base font-semibold tracking-wide text-primary">
              Direct Contact
            </p>
            <div className="space-y-3 text-sm">
              <a
                href={`tel:${config.donationPhone}`}
                className="flex items-center gap-2.5 rounded-lg bg-deep-foreground/5 p-2.5 text-deep-foreground hover:bg-deep-foreground/10 hover:text-primary transition"
              >
                <Phone className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-[11px] text-deep-foreground/60 uppercase font-semibold">Hotline & WhatsApp</p>
                  <p className="font-semibold">{config.donationPhone}</p>
                </div>
              </a>

              <a
                href={gmailComposeUrl(config.contactEmail)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 rounded-lg bg-deep-foreground/5 p-2.5 text-deep-foreground hover:bg-deep-foreground/10 hover:text-primary transition"
              >
                <Mail className="h-4 w-4 text-primary" />
                <div className="min-w-0">
                  <p className="text-[11px] text-deep-foreground/60 uppercase font-semibold">Questions? Email Us</p>
                  <p className="truncate font-semibold">{config.contactEmail}</p>
                </div>
              </a>

              <a
                href="https://jjtrust.org/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline pt-1"
              >
                <span>Visit Junior Jinnah Trust (jjtrust.org)</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Legal & Portal Bar */}
      <div className="border-t border-deep-foreground/10 bg-deep/80 px-6 py-6 text-xs text-deep-foreground/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p>
            © {new Date().getFullYear()} {config.name}. All contributions directly support Junior Jinnah Trust educational programs.
          </p>

          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/thejuniorjinnahtrust"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-deep-foreground/60"
                aria-label="Facebook"
              >
                <FacebookIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://wa.link/tue7xa"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-deep-foreground/60"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.instagram.com/jinnahjuniortrust/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-deep-foreground/60"
                aria-label="Instagram"
              >
                <InstagramIcon className="h-3.5 w-3.5" />
              </a>
              <a
                href="https://www.linkedin.com/company/54089173/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors text-deep-foreground/60"
                aria-label="LinkedIn"
              >
                <LinkedInIcon className="h-3.5 w-3.5" />
              </a>
            </div>

            <span className="text-deep-foreground/30">•</span>

            <Link
              to="/admin"
              className="hover:text-primary transition-colors text-deep-foreground/50 hover:underline"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
