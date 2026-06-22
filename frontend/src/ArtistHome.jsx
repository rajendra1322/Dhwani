import { useNavigate } from "react-router-dom";
import { ArrowRight, CalendarClock, LayoutGrid, Megaphone, Sparkles, Wallet } from "lucide-react";
import { BentoCard, BentoGrid, BentoMetric, BentoShell } from "./components/artist/Bento";

const quickActions = [
  {
    title: "Programs",
    body: "Create performances, workshops, and packages with clear pricing.",
    icon: Megaphone,
    path: "/a/programs",
    accent: "from-[#c45c26]/30 to-transparent",
  },
  {
    title: "Calendar",
    body: "Set open days, block time off, and keep availability tidy.",
    icon: CalendarClock,
    path: "/a/calendar",
    accent: "from-[#1e2a5e]/35 to-transparent",
  },
  {
    title: "Bookings",
    body: "Review requests quickly and keep your event inbox under control.",
    icon: Wallet,
    path: "/a/bookings",
    accent: "from-emerald-500/25 to-transparent",
  },
];

export default function ArtistHome() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <BentoShell
        eyebrow="Artist dashboard"
        title="Welcome back"
        description="Shape your calendar, publish programs, and respond to bookings from a space that feels clean, fast, and premium."
        actions={
          <>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium text-[#5c4f3d]">
              <Sparkles className="h-4 w-4 text-[#c45c26]" />
              Dhwani
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c45c26]/20 bg-[#fff3ea] px-4 py-2 text-xs font-medium text-[#c45c26]">
              <LayoutGrid className="h-4 w-4" />
              Event Management
            </div>
          </>
        }
      >
        {/* <BentoGrid className="grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <BentoCard className="bg-white/[0.05]">
            <div className="hidden gap-4 md:grid md:grid-cols-3">
              <BentoMetric
                label="Programs"
                value="Fast setup"
                hint="Pricing, venue, and duration"
                accent="bg-[#c45c26]"
              />
              <BentoMetric
                label="Calendar"
                value="Always clear"
                hint="Open days and block dates"
                accent="bg-[#1e2a5e]"
              />
              <BentoMetric
                label="Bookings"
                value="One inbox"
                hint="Accept or reject requests"
                accent="bg-emerald-500"
              />
            </div>
          </BentoCard>

          <BentoCard className="bg-gradient-to-br from-[#c45c26]/18 via-white/[0.03] to-[#1e2a5e]/20">
            <div className="flex h-full flex-col justify-between gap-5">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.24em] text-[#6b5b49]">Next step</p>
                <h2 className="text-2xl font-serif text-[#1e2a5e]">
                  Create a stronger profile and fill your booking pipeline.
                </h2>
                <p className="text-sm leading-6 text-[#5c4f3d]">
                  Use the Programs page to package your offerings, then keep your calendar
                  open for the right dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/a/programs/new")}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#c45c26] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#a34c1f]"
              >
                Create a program
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </BentoCard>
        </BentoGrid> */}
      </BentoShell>

      <BentoGrid className="grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <BentoCard
              key={action.title}
              className={`group cursor-pointer bg-gradient-to-br ${action.accent}`}
              onClick={() => navigate(action.path)}
            >
              <div className="flex h-full flex-col justify-between gap-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-[#6b5b49]">
                      Quick action
                    </p>
                    <h2 className="mt-2 text-2xl font-serif text-[#1e2a5e]">{action.title}</h2>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-[#5c4f3d]">
                      {action.body}
                    </p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-black/10 bg-white text-[#1e2a5e] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-[#c45c26]">
                  Open
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </div>
              </div>
            </BentoCard>
          );
        })}
      </BentoGrid>
    </div>
  );
}
