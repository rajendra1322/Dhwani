import { ArrowRight, LayoutDashboard } from "lucide-react";

export default function AdminHome() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs uppercase tracking-[0.24em] text-white/45">
              Admin control room
            </p>
            <h1 className="text-3xl font-serif text-[#f4e9d8] sm:text-4xl">
              Manage Dhwani from a responsive dashboard
            </h1>
            <p className="max-w-xl text-sm leading-6 text-white/65 sm:text-base">
              Keep an eye on platform activity, users, and bookings from any screen size.
              This home view now scales cleanly on mobile, tablet, and desktop.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#c45c26]/30 bg-[#c45c26]/15 px-4 py-2.5 text-sm font-medium text-[#f4d4bc]">
              <ArrowRight className="h-4 w-4" />
              Responsive layout enabled
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/75">
              <LayoutDashboard className="h-4 w-4" />
              Mobile-first dashboard
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          accent="Dash"
          title="Platform health"
          value="All systems ready"
          body="Dashboard layout now adapts to narrow screens without clipping."
        />
        <MetricCard
          accent="Users"
          title="Users"
          value="Role-based access"
          body="Admin, artist, and user entry points remain easy to reach on mobile."
        />
        <MetricCard
          accent="Safe"
          title="Security"
          value="Protected routes"
          body="Responsive navigation works with the existing auth flow."
        />
      </section>
    </div>
  );
}

function MetricCard({ accent, title, value, body }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:bg-white/[0.06]">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#c45c26]/20 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[#f4d4bc]">
          {accent}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/65">{title}</p>
          <h2 className="mt-1 text-lg font-semibold text-[#f4e9d8]">{value}</h2>
          <p className="mt-2 text-sm leading-6 text-white/55">{body}</p>
        </div>
      </div>
    </div>
  );
}
