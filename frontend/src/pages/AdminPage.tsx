import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  UserPlus,
  Building2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { EstateStatusBadge } from "../components/Badge";
import Footer from "../components/Footer";
const HERO_BG =
  "https://static.vecteezy.com/system/resources/thumbnails/069/793/065/small/modern-homes-sunset-family-bikes-pathway-suburban-life-real-estate-marketing-free-photo.jpg";

interface ConfirmModal {
  action: "approve" | "deny";
  estateId: string;
  estateName: string;
}

export default function AdminPage() {
  const { user } = useAuth();
  const { estates, updateEstateStatus, promoteToAdmin } = useData();
  const navigate = useNavigate();

  const [confirm, setConfirm] = useState<ConfirmModal | null>(null);
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminMsg, setAddAdminMsg] = useState("");
  const [expandedEstate, setExpandedEstate] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "denied">(
    "pending",
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setConfirm(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!user || user.role !== "communest_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <Shield size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-[var(--muted-foreground)] text-sm">
          This page is only accessible to Communest Admins.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
        >
          Go Home
        </button>
      </div>
    );
  }

  const pending = estates.filter((e) => e.status === "pending");
  const approved = estates.filter((e) => e.status === "approved");
  const denied = estates.filter((e) => e.status === "denied");
  const displayed =
    activeTab === "pending"
      ? pending
      : activeTab === "approved"
        ? approved
        : denied;

  function handleAction(
    action: "approve" | "deny",
    estateId: string,
    estateName: string,
  ) {
    setConfirm({ action, estateId, estateName });
  }

  function executeAction() {
    if (!confirm) return;
    const status = confirm.action === "approve" ? "approved" : "denied";
    updateEstateStatus(confirm.estateId, status);
    if (status === "approved") {
      const estate = estates.find((e) => e.id === confirm.estateId);
      if (estate?.adminId) promoteToAdmin(estate.adminId, estate.id);
    }
    setConfirm(null);
  }

  function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault();
    if (!addAdminEmail.trim()) return;
    setAddAdminMsg(
      `Invitation sent to ${addAdminEmail}. They will receive an email with admin access instructions.`,
    );
    setAddAdminEmail("");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-28 pb-16 flex flex-col items-center text-center">
        <img
          src={HERO_BG}
          alt="Admin panel"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium mb-4">
            <Shield size={12} />
            Communest Admin Panel
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-slate-300">
            Manage estate approvals, oversee the platform, and maintain quality
            standards across all of Kenya.
          </p>
        </div>
      </section>

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Pending Review",
              value: pending.length,
              color: "amber",
              icon: Clock,
            },
            {
              label: "Approved Estates",
              value: approved.length,
              color: "emerald",
              icon: CheckCircle,
            },
            {
              label: "Denied",
              value: denied.length,
              color: "red",
              icon: XCircle,
            },
          ].map(({ label, value, color, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-5 text-center">
              <Icon
                size={22}
                className={`mx-auto mb-2 ${color === "amber" ? "text-amber-400" : color === "emerald" ? "text-emerald-400" : "text-red-400"}`}
              />
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Add Admin */}
        <section className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <UserPlus size={17} className="text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">
              Add Communest Admin
            </h2>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Enter the email of a{" "}
            <strong className="text-white">Regular User</strong> account to
            grant them Communest Admin privileges.
          </p>
          <form onSubmit={handleAddAdmin} className="flex gap-3">
            <input
              type="email"
              value={addAdminEmail}
              onChange={(e) => setAddAdminEmail(e.target.value)}
              placeholder="regular-user@gmail.com"
              className="input-base flex-1"
              required
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all whitespace-nowrap"
            >
              Add Admin
            </button>
          </form>
          {addAdminMsg && (
            <div className="mt-3 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-2.5">
              {addAdminMsg}
            </div>
          )}
        </section>

        {/* Estates */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
              <Building2 size={17} className="text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Estate Management</h2>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-[var(--muted)] p-1 mb-5 w-fit">
            {(
              [
                { key: "pending", label: `Pending (${pending.length})` },
                { key: "approved", label: `Approved (${approved.length})` },
                { key: "denied", label: `Denied (${denied.length})` },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === key
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted-foreground)] hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {displayed.length === 0 ? (
            <div className="text-center py-16 text-[var(--muted-foreground)]">
              <Building2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-white/70">
                No estates{" "}
                {activeTab === "pending"
                  ? "awaiting review"
                  : activeTab === "approved"
                    ? "approved yet"
                    : "denied yet"}
                .
              </p>
              {activeTab === "pending" && (
                <p className="text-sm mt-1">
                  All submissions have been processed.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((estate) => (
                <div
                  key={estate.id}
                  className="glass-card rounded-2xl overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                    <img
                      src={estate.estatePhoto}
                      alt={estate.name}
                      className="w-full sm:w-28 h-28 sm:h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-bold text-white">{estate.name}</h3>
                        <EstateStatusBadge status={estate.status} />
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-1">
                        {estate.location}, {estate.county}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {estate.units} units ·{" "}
                        {estate.totalArea.toLocaleString()} m² ·{" "}
                        {estate.managementName}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setExpandedEstate(
                            expandedEstate === estate.id ? null : estate.id,
                          )
                        }
                        className="p-2 rounded-lg border border-[var(--border)] text-[var(--muted-foreground)] hover:text-white hover:border-[var(--accent)]/50 transition-all"
                      >
                        {expandedEstate === estate.id ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </button>
                      {estate.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleAction("approve", estate.id, estate.name)
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/25 border border-emerald-500/20 transition-all"
                          >
                            <CheckCircle size={14} /> Approve
                          </button>
                          <button
                            onClick={() =>
                              handleAction("deny", estate.id, estate.name)
                            }
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 border border-red-500/20 transition-all"
                          >
                            <XCircle size={14} /> Deny
                          </button>
                        </>
                      )}
                      {estate.status === "approved" && (
                        <button
                          onClick={() =>
                            handleAction("deny", estate.id, estate.name)
                          }
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/15 text-red-400 text-sm font-semibold hover:bg-red-500/25 border border-red-500/20 transition-all"
                        >
                          <XCircle size={14} /> Revoke
                        </button>
                      )}
                    </div>
                  </div>
                  {expandedEstate === estate.id && (
                    <div className="border-t border-[var(--border)] px-5 py-4 bg-[var(--muted)]/30">
                      <div className="grid sm:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">
                              Management
                            </span>
                            <span className="text-white">
                              {estate.managementName}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">
                              Email
                            </span>
                            <span className="text-white">
                              {estate.managementEmail}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">
                              Phone
                            </span>
                            <span className="text-white">
                              {estate.managementPhone}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">
                              Title Deed
                            </span>
                            <span className="text-white font-mono text-xs">
                              {estate.titleDeedNumber}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[var(--muted-foreground)]">
                              Submitted
                            </span>
                            <span className="text-white">
                              {estate.createdAt}
                            </span>
                          </div>
                          {estate.description && (
                            <div>
                              <p className="text-[var(--muted-foreground)] text-xs leading-relaxed">
                                {estate.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-2xl p-6 shadow-2xl"
            style={{
              background: "rgba(8,13,26,0.98)",
              border: "1px solid rgba(37,99,235,0.2)",
            }}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${confirm.action === "approve" ? "bg-emerald-500/15" : "bg-red-500/15"}`}
            >
              {confirm.action === "approve" ? (
                <CheckCircle size={24} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={24} className="text-red-400" />
              )}
            </div>
            <h3 className="text-lg font-bold text-white text-center mb-2">
              {confirm.action === "approve"
                ? "Approve Estate?"
                : "Deny/Revoke Estate?"}
            </h3>
            <p className="text-sm text-[var(--muted-foreground)] text-center mb-6">
              Are you sure you want to{" "}
              <strong className="text-white">{confirm.action}</strong>{" "}
              <strong className="text-white">{confirm.estateName}</strong>?
              {confirm.action === "approve"
                ? " It will appear on the Explore page and the admin will be notified."
                : " The estate will be removed from public listing and the admin will be notified."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-white text-sm font-semibold hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={executeAction}
                className={`flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${confirm.action === "approve" ? "bg-emerald-600 hover:bg-emerald-500" : "bg-red-600 hover:bg-red-500"}`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
