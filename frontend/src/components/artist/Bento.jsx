import { cn } from "../../utils/cn";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/Card";

export function BentoShell({ eyebrow, title, description, actions, children, className }) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/90 p-5 shadow-[0_20px_60px_rgba(30,42,94,0.08)] backdrop-blur-sm sm:p-6",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(196,92,38,0.10),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(30,42,94,0.08),_transparent_35%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(20,20,20,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      <div className="relative">
        {(eyebrow || title || description || actions) && (
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-2">
              {eyebrow && (
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-[#6b5b49]">
                  {eyebrow}
                </p>
              )}
              {title && <h1 className="text-3xl font-serif text-[#1e2a5e] sm:text-4xl">{title}</h1>}
              {description && (
                <p className="max-w-2xl text-sm leading-6 text-[#5c4f3d] sm:text-base">
                  {description}
                </p>
              )}
            </div>
            {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

export function BentoGrid({ className, children }) {
  return <div className={cn("grid gap-4", className)}>{children}</div>;
}

export function BentoCard({ className, children, ...props }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-black/10 bg-white shadow-[0_16px_50px_rgba(30,42,94,0.06)] backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <CardContent className="relative p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

export function BentoMetric({ label, value, hint, accent = "bg-[#c45c26]" }) {
  return (
    <div className="rounded-[1.4rem] border border-black/10 bg-white p-4">
      <div className="flex items-start gap-4">
        <div className={cn("h-11 w-11 shrink-0 rounded-2xl", accent)} />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-[#6b5b49]">{label}</p>
          <p className="mt-1 text-lg font-semibold text-[#1e2a5e]">{value}</p>
          {hint && <p className="mt-1 text-sm text-[#5c4f3d]">{hint}</p>}
        </div>
      </div>
    </div>
  );
}

export { Card, CardContent, CardDescription, CardHeader, CardTitle };
