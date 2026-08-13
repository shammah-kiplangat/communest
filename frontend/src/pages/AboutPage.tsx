import { Link } from "react-router-dom";
import { Shield, Target, Globe, Heart, ArrowRight } from "lucide-react";
import Footer from "../components/Footer";
const HERO_BG =
  "https://static.vecteezy.com/system/resources/thumbnails/069/793/065/small/modern-homes-sunset-family-bikes-pathway-suburban-life-real-estate-marketing-free-photo.jpg";

const VALUES = [
  {
    icon: Shield,
    title: "Trust & Transparency",
    desc: "Every estate on Communest is vetted through rigorous approval. We only list properties that meet our quality standards, so you can rent with confidence.",
  },
  {
    icon: Target,
    title: "Kenya-First Mission",
    desc: "Built exclusively for Kenya, Communest understands the local real estate landscape — from Nairobi's bustling neighborhoods to Mombasa's coastal estates.",
  },
  {
    icon: Globe,
    title: "Nationwide Coverage",
    desc: "With estates across 20 Kenyan counties and growing, we are working toward making quality housing accessible to every Kenyan, wherever they are.",
  },
  {
    icon: Heart,
    title: "Community Driven",
    desc: "We believe housing is more than a transaction — it's about building communities. Our platform fosters connections between tenants and estate managers.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-28 pb-20 flex flex-col items-center text-center">
        <img
          src={HERO_BG}
          alt="About Communest — residential estates"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-3xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            Our Story
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            About Communest
          </h1>
          <p className="text-xl text-slate-300 leading-relaxed">
            Transforming the way Kenyans find homes and manage estates — one
            community at a time.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-4">
              Our Mission
            </p>
            <h2 className="text-3xl font-bold text-white mb-5 leading-tight">
              Making Quality Housing Accessible to Every Kenyan
            </h2>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-4">
              Communest was founded with a single, clear mission: to simplify
              the process of finding quality housing in Kenya. In a country
              where property search is often fragmented, unclear, and
              frustrating, we set out to build a platform that brings clarity,
              trust, and efficiency.
            </p>
            <p className="text-[var(--muted-foreground)] leading-relaxed mb-6">
              From Nairobi's Westlands to Mombasa's Nyali, from Nakuru's
              Milimani to Kisumu's lakeshore, Communest connects tenants with
              verified estates across Kenya. We don't just list properties — we
              build communities.
            </p>
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
            >
              Explore Estates <ArrowRight size={16} />
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://picsum.photos/seed/aboutpage/700/500"
              alt="Modern apartment complex"
              className="rounded-2xl w-full object-cover shadow-2xl"
              style={{ height: "380px" }}
            />
            <div
              className="absolute -bottom-5 -left-5 rounded-xl p-5"
              style={{
                background: "rgba(8,13,26,0.9)",
                border: "1px solid rgba(37,99,235,0.2)",
                backdropFilter: "blur(20px)",
              }}
            >
              <div className="text-3xl font-black text-white">200+</div>
              <div className="text-sm text-[var(--muted-foreground)]">
                Estates Listed
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[var(--card)] border-y border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl font-bold text-white">Our Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl p-6 hover:border-blue-500/30 hover:-translate-y-1 transition-all duration-300"
                style={{
                  background: "rgba(13,20,40,0.6)",
                  border: "1px solid rgba(37,99,235,0.12)",
                }}
              >
                <div className="w-11 h-11 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform overview */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            The Platform
          </p>
          <h2 className="text-3xl font-bold text-white mb-4">
            Built for Every Stakeholder
          </h2>
          <p className="text-[var(--muted-foreground)] max-w-lg mx-auto">
            Communest serves four key groups — each with features tailored
            specifically to their needs.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {[
            {
              title: "House Seekers",
              color: "blue",
              points: [
                "Browse hundreds of verified estates",
                "Filter by county and price range",
                "View detailed house photos and amenities",
                "Submit rental applications online",
              ],
            },
            {
              title: "Estate Admins",
              color: "emerald",
              points: [
                "List and manage your entire estate",
                "Receive and approve tenant applications",
                "Post maintenance updates and notifications",
                "Track rent payments and generate receipts",
              ],
            },
            {
              title: "Tenants",
              color: "purple",
              points: [
                "Access your estate dashboard",
                "Pay rent and download receipts",
                "Receive estate notifications and alerts",
                "Submit maintenance inquiries directly",
              ],
            },
            {
              title: "Communest Admins",
              color: "amber",
              points: [
                "Review and approve estate listings",
                "Maintain platform quality standards",
                "Manage admin team access",
                "Oversee the entire ecosystem",
              ],
            },
          ].map(({ title, color, points }) => (
            <div key={title} className="glass-card rounded-2xl p-6">
              <h3
                className={`font-bold text-lg mb-4 ${color === "blue" ? "text-blue-400" : color === "emerald" ? "text-emerald-400" : color === "purple" ? "text-purple-400" : "text-amber-400"}`}
              >
                {title}
              </h3>
              <ul className="space-y-2">
                {points.map((pt) => (
                  <li
                    key={pt}
                    className="flex items-start gap-2.5 text-sm text-[var(--muted-foreground)]"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${color === "blue" ? "bg-blue-400" : color === "emerald" ? "bg-emerald-400" : color === "purple" ? "bg-purple-400" : "bg-amber-400"}`}
                    />
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(29,78,216,0.3), rgba(37,99,235,0.15))",
            border: "1px solid rgba(37,99,235,0.2)",
          }}
        >
          <h2 className="text-3xl font-bold text-white mb-4">
            Join the Communest Community
          </h2>
          <p className="text-[var(--muted-foreground)] mb-8">
            Whether you're looking for a home or an estate to manage, Communest
            is the platform built for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
            >
              Create Account
            </Link>
            <Link
              to="/explore"
              className="px-8 py-3.5 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
            >
              Explore Estates
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
