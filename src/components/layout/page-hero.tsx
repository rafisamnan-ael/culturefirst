import type { LucideIcon } from "lucide-react";

export function AnimatedBackdrop({ grid = true }: { grid?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="orb -right-28 -top-28 h-[460px] w-[460px] bg-jade/40 animate-orb-drift" />
      <div className="orb -bottom-32 -left-24 h-[440px] w-[440px] bg-navy-accent/50 animate-orb-drift delay-2000" />
      <div className="orb left-1/2 top-1/3 h-[340px] w-[340px] -translate-x-1/2 bg-gold/25 animate-pulse-glow" />
      <div className="absolute inset-0 bg-gradient-aurora bg-size-200 opacity-25 animate-gradient-x" />
      {grid && <div className="absolute inset-0 bg-grid-faint opacity-50" />}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/60 to-transparent" />
      <div className="sheen-overlay" />
    </div>
  );
}

export function PageHero({
  eyebrow,
  icon: Icon,
  title,
  subtitle,
  align = "left",
  size = "default",
  children,
  className = "",
}: {
  eyebrow?: React.ReactNode;
  icon?: LucideIcon;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  align?: "left" | "center";
  size?: "default" | "compact";
  children?: React.ReactNode;
  className?: string;
}) {
  const padding = size === "compact" ? "py-12 md:py-16" : "py-16 md:py-24";
  const centered = align === "center";

  return (
    <section
      data-no-animate
      className={`relative overflow-hidden border-b border-border bg-aurora-dark text-soft ${padding} ${className}`}
    >
      <AnimatedBackdrop />
      <div className={`container relative z-10 ${centered ? "max-w-3xl text-center" : "max-w-3xl"}`}>
        {eyebrow && (
          <div
            className={`mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-jade/30 bg-jade/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-jade-highlight backdrop-blur-sm ${
              centered ? "mx-auto" : ""
            }`}
          >
            {Icon && <Icon className="h-3.5 w-3.5 text-gold-light" />}
            {eyebrow}
          </div>
        )}
        <h1 className="animate-fade-up text-balance text-4xl font-bold tracking-tight text-gradient-lux sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        <div className="mt-5 h-1 w-24 rounded-full bg-gradient-to-r from-jade via-gold to-transparent animate-fade-up delay-100" />
        {subtitle && (
          <p
            className={`mt-6 animate-fade-up delay-200 text-lg leading-relaxed text-soft/80 sm:text-xl ${
              centered ? "mx-auto" : ""
            }`}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="mt-8 animate-fade-up delay-300">{children}</div>}
      </div>
    </section>
  );
}
