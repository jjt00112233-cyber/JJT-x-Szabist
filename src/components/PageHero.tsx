import type { ReactNode } from "react";

export function PageHero({
  eyebrow,
  title,
  children,
  backgroundImage,
  imagePosition = "center",
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  backgroundImage?: string;
  imagePosition?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-deep text-deep-foreground">
      {backgroundImage ? (
        <>
          <img
            src={backgroundImage}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
            className={`absolute inset-0 -z-20 h-full w-full object-cover ${
              imagePosition === "top"
                ? "object-top"
                : imagePosition === "bottom"
                ? "object-bottom"
                : "object-center"
            }`}
          />
          <div aria-hidden="true" className="hero-photo-shade absolute inset-0 -z-10" />
        </>
      ) : (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 animate-drift rounded-full border-[40px] border-deep-foreground/5"
        />
      )}
      <div className="relative mx-auto max-w-6xl px-5 pt-28 pb-12 sm:px-6 sm:pt-36 sm:pb-16 md:pb-20 animate-rise">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-primary">
          {eyebrow}
        </p>
        <h1 className="mt-2.5 max-w-3xl text-2xl font-semibold leading-snug sm:text-3xl md:text-5xl">
          {title}
        </h1>
        {children && (
          <div className="mt-4 max-w-2xl text-base sm:text-lg text-deep-foreground/85 leading-relaxed">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
