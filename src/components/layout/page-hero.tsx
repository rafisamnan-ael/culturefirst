import type { LucideIcon } from "lucide-react";

export function AnimatedBackdrop({ grid = true }: { grid?: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -right-28 -top-28 h-[460px] w-[460px] rounded-full bg-jade/20 blur-[110px] animate-blob" />
      <div className="absolute -bottom-32 -left-24 h-[420px] w-[420px] rounded-full bg-navy-accent/30 blur-[120px] animate-blob delay-2000" />
      <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-gold/10 blur-[120px] animate-pulse-glow" />
      {grid && <div className="absolute inset-0 bg-grid-faint opacity-60" />}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-navy/40 to-transparent" />
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
    <section className={`relative overflow-hidden border-b border-border bg-mesh text-soft ${padding} ${className}`}>
      <AnimatedBackdrop />
      <div className={`container relative z-10 ${centered ? "max-w-3xl text-center" : "max-w-3xl"}`}>
        {eyebrow && (
          <div
            className={`mb-6 inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-jade-highlight backdrop-blur-sm ${
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
