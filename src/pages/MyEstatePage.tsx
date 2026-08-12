import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  Bell,
  Wrench,
  CreditCard,
  MessageSquare,
  Plus,
  Trash2,
  Check,
  X,
  Home,
  Download,
  ListPlus,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { apiRequest } from "../utils/api";
import {
  EstateStatusBadge,
  MaintenanceBadge,
  HouseBadge,
  InquiryBadge,
  PaymentStatusBadge,
} from "../components/Badge";
import { ImageUpload, MultiImageUpload } from "../components/ImageUpload";
import Footer from "../components/Footer";
import type { MaintenanceStatus } from "../types";

type Tab =
  | "overview"
  | "management"
  | "notifications"
  | "maintenance"
  | "payments"
  | "inquiries";

const TABS: { key: Tab; label: string; icon: typeof Building2 }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "management", label: "Management", icon: Home },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "maintenance", label: "Maintenance", icon: Wrench },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "inquiries", label: "Inquiries", icon: MessageSquare },
];

export default function MyEstatePage() {
  const { user } = useAuth();
  const {
    estates,
    houses,
    notifications,
    maintenanceItems,
    payments,
    inquiries,
    proposals,
    paymentOptions,
    addNotification,
    deleteNotification,
    addMaintenance,
    updateMaintenanceStatus,
    deleteMaintenance,
    addHouse,
    updateHouseStatus,
    addPaymentOption,
    removePaymentOption,
    updatePaymentStatus,
    addInquiry,
    approveProposal,
    rejectProposal,
    updateEstatePhoto,
  } = useData();
  const [tab, setTab] = useState<Tab>("overview");

  // Forms
  const [notifTitle, setNotifTitle] = useState("");
  const [notifDate, setNotifDate] = useState("");
  const [notifDesc, setNotifDesc] = useState("");
  const [notifSentTo, setNotifSentTo] = useState<string[]>([]);
  const [maintTitle, setMaintTitle] = useState("");
  const [maintDesc, setMaintDesc] = useState("");
  const [maintStatus, setMaintStatus] =
    useState<MaintenanceStatus>("scheduled");
  const [payOptMethod, setPayOptMethod] = useState("");
  const [payOptDetails, setPayOptDetails] = useState("");
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payInput, setPayInput] = useState("");
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState<string | null>(null);
  const [inqMsg, setInqMsg] = useState("");
  const [houseNumber, setHouseNumber] = useState("");
  const [houseArea, setHouseArea] = useState("");
  const [houseRooms, setHouseRooms] = useState("");
  const [houseRent, setHouseRent] = useState("");
  const [housePhone, setHousePhone] = useState("");
  const [houseAmenities, setHouseAmenities] = useState("");
  const [housePhotos, setHousePhotos] = useState<string[]>([]);
  const [listHouseMode, setListHouseMode] = useState<null | "single" | "bulk">(
    null,
  );
  const [expandedHouseId, setExpandedHouseId] = useState<string | null>(null);
  const [csvText, setCsvText] = useState("");

  if (
    !user ||
    (user.role !== "estate_admin" &&
      user.role !== "tenant" &&
      user.role !== "communest_admin")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <Building2 size={40} className="text-[var(--muted-foreground)]" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-[var(--muted-foreground)] text-sm text-center">
          This page is for Estate Admins and Tenants only.
        </p>
        {!user && (
          <Link
            to="/auth"
            className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
          >
            Sign In
          </Link>
        )}
      </div>
    );
  }

  const estate = estates.find((e) => e.id === user.estateId);
  if (!estate) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <Building2 size={40} className="text-amber-400" />
        <h2 className="text-xl font-bold text-white">No Estate Found</h2>
        <p className="text-[var(--muted-foreground)] text-sm text-center">
          {user.role === "estate_admin"
            ? "Your estate hasn't been approved yet or isn't linked to your account."
            : "You don't appear to be linked to an estate. Contact your estate admin."}
        </p>
        <Link
          to="/explore"
          className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
        >
          Explore Estates
        </Link>
      </div>
    );
  }

  const isAdmin = user.role === "estate_admin";
  const estateHouses = houses.filter((h) => h.estateId === estate.id);
  const vacantHouses = estateHouses.filter((h) => h.status === "vacant");
  const occupiedHouses = estateHouses.filter((h) => h.status === "occupied");
  const estateNotifs = notifications.filter((n) => n.estateId === estate.id);
  const estateMaintenance = maintenanceItems.filter(
    (m) => m.estateId === estate.id,
  );
  const estatePayments = payments.filter(
    (p) =>
      p.estateId === estate.id &&
      (!isAdmin || p.tenantId === user.id || isAdmin),
  );
  const estateInquiries = inquiries.filter((i) => i.estateId === estate.id);
  const estateProposals = proposals.filter((p) => p.estateId === estate.id);
  const estatePayOpts = paymentOptions.filter((p) => p.estateId === estate.id);

  // Tenant-specific
  const myPayments = payments.filter(
    (p) => p.estateId === estate.id && p.tenantId === user.id,
  );

  function submitHouse(e: React.FormEvent) {
    e.preventDefault();
    addHouse({
      estateId: estate!.id,
      houseNumber: houseNumber.trim(),
      totalArea: Number(houseArea),
      rooms: Number(houseRooms),
      photos: housePhotos,
      amenities: houseAmenities
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      rent: Number(houseRent),
      managerPhone: housePhone.trim(),
      status: "vacant",
    });
    setHouseNumber("");
    setHouseArea("");
    setHouseRooms("");
    setHouseRent("");
    setHousePhone("");
    setHouseAmenities("");
    setHousePhotos([]);
    setListHouseMode(null);
  }

  function submitBulkCSV(e: React.FormEvent) {
    e.preventDefault();
    const lines = csvText.trim().split("\n").slice(1); // skip header
    lines.forEach((line) => {
      const [hNum, area, rooms, rent, phone, amenitiesStr] = line
        .split(",")
        .map((s) => s.trim());
      if (hNum && area && rooms && rent && phone) {
        addHouse({
          estateId: estate!.id,
          houseNumber: hNum,
          totalArea: Number(area),
          rooms: Number(rooms),
          photos: [],
          amenities: amenitiesStr
            ? amenitiesStr.split(";").map((s) => s.trim())
            : [],
          rent: Number(rent),
          managerPhone: phone,
          status: "vacant",
        });
      }
    });
    setCsvText("");
    setListHouseMode(null);
  }

  const visibleTabs = isAdmin
    ? TABS
    : TABS.filter((t) =>
        [
          "overview",
          "notifications",
          "maintenance",
          "payments",
          "inquiries",
        ].includes(t.key),
      );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-16 h-64 flex items-end">
        <img
          src={estate.estatePhoto}
          alt={estate.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(8,13,26,1) 0%, rgba(8,13,26,0.5) 60%, transparent 100%)",
          }}
        />
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  {estate.name}
                </h1>
                <EstateStatusBadge status={estate.status} />
              </div>
              <p className="text-sm text-slate-300">
                {estate.location}, {estate.county}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] bg-[var(--card)] sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 overflow-x-auto">
            {visibleTabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  tab === key
                    ? "border-[var(--accent)] text-blue-400"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Overview ── */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Units", value: estate.units },
                { label: "Vacant Houses", value: vacantHouses.length },
                { label: "Occupied Houses", value: occupiedHouses.length },
                {
                  label: "Total Area",
                  value: `${estate.totalArea.toLocaleString()} m²`,
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="glass-card rounded-2xl p-5 text-center"
                >
                  <div className="text-2xl font-bold text-white">{value}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">
                    {label}
                  </div>
                </div>
              ))}
            </div>
            {isAdmin && (
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3">Estate Photo</h3>
                <ImageUpload
                  value={estate.estatePhoto}
                  onChange={(newPhoto) =>
                    updateEstatePhoto(estate.id, newPhoto)
                  }
                  onClear={() => {}}
                  previewHeight="h-44"
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-5">
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3">
                  Estate Information
                </h3>
                <div className="space-y-2 text-sm">
                  {[
                    ["Management", estate.managementName],
                    ["Email", estate.managementEmail],
                    ["Phone", estate.managementPhone],
                    ["Total Area", `${estate.totalArea.toLocaleString()} m²`],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[var(--muted-foreground)]">
                        {k}
                      </span>
                      <span className="text-white">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h3 className="font-semibold text-white mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-2">
                  {estateNotifs.slice(0, 3).map((n) => (
                    <div key={n.id} className="flex items-start gap-2 text-sm">
                      <Bell
                        size={13}
                        className="text-blue-400 mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-white">{n.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {n.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                  {estateNotifs.length === 0 && (
                    <p className="text-sm text-[var(--muted-foreground)]">
                      No recent activity.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Management (Admin only) ── */}
        {tab === "management" && isAdmin && (
          <div className="space-y-6">
            {/* List houses */}
            {!listHouseMode ? (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">
                  Register Houses
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setListHouseMode("bulk")}
                    className="p-5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-left"
                  >
                    <ListPlus size={24} className="text-blue-400 mb-3" />
                    <h3 className="font-semibold text-white mb-1">
                      List Houses in Bulk
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Upload a CSV file to register multiple houses at once. CSV
                      format: HouseNo, Area, Rooms, Rent, ManagerPhone,
                      Amenities
                    </p>
                  </button>
                  <button
                    onClick={() => setListHouseMode("single")}
                    className="p-5 rounded-xl border border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all text-left"
                  >
                    <Home size={24} className="text-emerald-400 mb-3" />
                    <h3 className="font-semibold text-white mb-1">
                      List a Single House
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Fill in a form to register one house at a time with all
                      details including photos and amenities.
                    </p>
                  </button>
                </div>
              </div>
            ) : listHouseMode === "bulk" ? (
              <div className="glass-card rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Bulk Upload Houses
                    </h2>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                      Paste CSV data below — one house per row
                    </p>
                  </div>
                  <button
                    onClick={() => setListHouseMode(null)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Column reference table */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
                    Column Reference
                  </p>
                  <div className="rounded-xl overflow-hidden border border-[var(--border)]">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-[var(--muted)]/60">
                          <th className="text-left px-3 py-2 text-[var(--muted-foreground)] font-semibold w-8">
                            #
                          </th>
                          <th className="text-left px-3 py-2 text-[var(--muted-foreground)] font-semibold">
                            Column
                          </th>
                          <th className="text-left px-3 py-2 text-[var(--muted-foreground)] font-semibold">
                            Format
                          </th>
                          <th className="text-left px-3 py-2 text-[var(--muted-foreground)] font-semibold">
                            Example
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {
                            col: "HouseNo",
                            fmt: "Text",
                            ex: "A101",
                            req: true,
                          },
                          {
                            col: "Area",
                            fmt: "Number (m²)",
                            ex: "85",
                            req: true,
                          },
                          { col: "Rooms", fmt: "Number", ex: "2", req: true },
                          {
                            col: "Rent",
                            fmt: "Number (KES)",
                            ex: "45000",
                            req: true,
                          },
                          {
                            col: "ManagerPhone",
                            fmt: "+254XXXXXXXXX",
                            ex: "+254712345678",
                            req: true,
                          },
                          {
                            col: "Amenities",
                            fmt: "Text (semicolon-separated)",
                            ex: "WiFi;Parking;Gym",
                            req: false,
                          },
                        ].map(({ col, fmt, ex, req }, i) => (
                          <tr
                            key={col}
                            className={`border-t border-[var(--border)] ${i % 2 === 0 ? "" : "bg-[var(--muted)]/20"}`}
                          >
                            <td className="px-3 py-2 text-[var(--muted-foreground)] font-mono">
                              {i + 1}
                            </td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-white font-mono">
                                {col}
                              </span>
                              {req ? (
                                <span className="ml-1.5 text-red-400 text-[9px] font-bold">
                                  required
                                </span>
                              ) : (
                                <span className="ml-1.5 text-[var(--muted-foreground)] text-[9px]">
                                  optional
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-[var(--muted-foreground)]">
                              {fmt}
                            </td>
                            <td className="px-3 py-2 text-blue-400 font-mono">
                              {ex}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CSV input */}
                <form onSubmit={submitBulkCSV} className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted-foreground)]">
                        CSV Data
                      </p>
                      {csvText.trim() && (
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {Math.max(
                            0,
                            csvText
                              .trim()
                              .split("\n")
                              .filter((l) => l.trim()).length - 1,
                          )}{" "}
                          row
                          {csvText
                            .trim()
                            .split("\n")
                            .filter((l) => l.trim()).length -
                            1 !==
                          1
                            ? "s"
                            : ""}{" "}
                          detected
                        </span>
                      )}
                    </div>

                    {/* Pinned header row */}
                    <div className="rounded-t-xl border border-b-0 border-[var(--border)] bg-[var(--muted)]/60 px-3 py-2 font-mono text-[10px] text-blue-400 select-none tracking-wide">
                      HouseNo,Area,Rooms,Rent,ManagerPhone,Amenities
                    </div>
                    <textarea
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={
                        "A101,85,2,45000,+254712345678,WiFi;Parking\nA102,65,1,28000,+254712345678,WiFi\nB201,95,3,60000,+254712345678,Gym;Pool"
                      }
                      rows={6}
                      className="w-full rounded-b-xl border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] font-mono text-xs px-3 py-2.5 resize-none focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all placeholder:text-[var(--muted-foreground)]/50"
                      spellCheck={false}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                    >
                      Upload Houses
                    </button>
                    {csvText && (
                      <button
                        type="button"
                        onClick={() => setCsvText("")}
                        className="px-4 py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] text-sm hover:text-white hover:bg-white/5 transition-all"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </form>
              </div>
            ) : (
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">List a House</h2>
                  <button
                    onClick={() => setListHouseMode(null)}
                    className="text-[var(--muted-foreground)] hover:text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
                <form
                  onSubmit={submitHouse}
                  className="grid sm:grid-cols-2 gap-4"
                >
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      House Number *
                    </label>
                    <input
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      placeholder="A101"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      Total Area (m²) *
                    </label>
                    <input
                      type="number"
                      value={houseArea}
                      onChange={(e) => setHouseArea(e.target.value)}
                      placeholder="85"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      Number of Rooms *
                    </label>
                    <input
                      type="number"
                      value={houseRooms}
                      onChange={(e) => setHouseRooms(e.target.value)}
                      placeholder="2"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      Monthly Rent (KES) *
                    </label>
                    <input
                      type="number"
                      value={houseRent}
                      onChange={(e) => setHouseRent(e.target.value)}
                      placeholder="45000"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      Manager Phone *
                    </label>
                    <input
                      type="tel"
                      value={housePhone}
                      onChange={(e) => setHousePhone(e.target.value)}
                      placeholder="+254712345678"
                      className="input-base"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                      Amenities (comma separated)
                    </label>
                    <input
                      type="text"
                      value={houseAmenities}
                      onChange={(e) => setHouseAmenities(e.target.value)}
                      placeholder="WiFi, Parking, Gym"
                      className="input-base"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <MultiImageUpload
                      values={housePhotos}
                      onChange={setHousePhotos}
                      label="House Photos"
                      hint="(optional)"
                      max={6}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                    >
                      Add House
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Proposals */}
            {estateProposals.filter((p) => p.status === "pending").length >
              0 && (
              <div className="glass-card rounded-2xl p-5">
                <h2 className="text-base font-bold text-white mb-4">
                  Rental Proposals{" "}
                  <span className="text-sm text-amber-400">
                    (
                    {
                      estateProposals.filter((p) => p.status === "pending")
                        .length
                    }{" "}
                    pending)
                  </span>
                </h2>
                <div className="space-y-3">
                  {estateProposals
                    .filter((p) => p.status === "pending")
                    .map((prop) => {
                      const h = houses.find((h) => h.id === prop.houseId);
                      return (
                        <div
                          key={prop.id}
                          className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white">
                              {prop.applicantName}
                            </p>
                            <p className="text-xs text-[var(--muted-foreground)]">
                              {prop.applicantEmail} · {prop.applicantPhone}
                            </p>
                            <p className="text-xs text-blue-400 mt-0.5">
                              Unit: {h?.houseNumber || prop.houseId}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveProposal(prop.id)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/25 border border-emerald-500/20 transition-all"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={() => rejectProposal(prop.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-400 text-xs font-semibold hover:bg-red-500/25 border border-red-500/20 transition-all"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Vacant houses */}
            <div>
              <h2 className="text-base font-bold text-white mb-3">
                Vacant Houses ({vacantHouses.length})
              </h2>
              {vacantHouses.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No vacant houses.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {vacantHouses.map((h) => (
                    <div key={h.id} className="glass-card rounded-xl p-4">
                      {h.photos[0] && (
                        <img
                          src={h.photos[0]}
                          alt={h.houseNumber}
                          className="w-full h-28 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-white">
                          Unit {h.houseNumber}
                        </span>
                        <HouseBadge status={h.status} />
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mb-2">
                        {h.rooms} bed · {h.totalArea}m² · KES{" "}
                        {h.rent.toLocaleString()}/mo
                      </p>
                      <button
                        onClick={() => updateHouseStatus(h.id, "occupied")}
                        className="w-full py-1.5 rounded-lg text-xs font-medium border border-slate-500/30 text-[var(--muted-foreground)] hover:bg-white/5 transition-all"
                      >
                        Mark as Occupied
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Occupied houses */}
            <div>
              <h2 className="text-base font-bold text-white mb-3">
                Occupied Houses ({occupiedHouses.length})
              </h2>
              {occupiedHouses.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No occupied houses.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {occupiedHouses.map((h) => {
                    const houseBills = payments.filter(
                      (p) => p.houseId === h.id,
                    );
                    const dueBills = houseBills.filter(
                      (p) => p.status === "due",
                    );
                    const allClear =
                      houseBills.length > 0 && dueBills.length === 0;
                    const isExpanded = expandedHouseId === h.id;
                    return (
                      <div
                        key={h.id}
                        className="glass-card rounded-xl overflow-hidden"
                      >
                        {/* Card header — clickable */}
                        <button
                          onClick={() =>
                            setExpandedHouseId(isExpanded ? null : h.id)
                          }
                          className="w-full p-4 text-left hover:bg-white/3 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-white">
                              Unit {h.houseNumber}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {houseBills.length > 0 &&
                                (dueBills.length > 0 ? (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                                    {dueBills.length} due
                                  </span>
                                ) : (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    All paid
                                  </span>
                                ))}
                              <ChevronDown
                                size={13}
                                className={`text-[var(--muted-foreground)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                              />
                            </div>
                          </div>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {h.rooms} bed · {h.totalArea}m² · KES{" "}
                            {h.rent.toLocaleString()}/mo
                          </p>
                          {h.occupiedAt && (
                            <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                              Occupied since{" "}
                              {new Date(h.occupiedAt).toLocaleDateString()}
                            </p>
                          )}
                        </button>

                        {/* Expanded bills panel */}
                        {isExpanded && (
                          <div className="border-t border-[var(--border)] bg-[var(--muted)]/30 px-4 py-3 space-y-2">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] mb-2">
                              Payment Records
                            </p>
                            {houseBills.length === 0 ? (
                              <p className="text-xs text-[var(--muted-foreground)] py-1">
                                No bills recorded for this unit.
                              </p>
                            ) : (
                              houseBills.map((bill) => (
                                <div
                                  key={bill.id}
                                  className="flex items-center justify-between gap-2 py-1.5 px-2.5 rounded-lg bg-[var(--muted)]/50"
                                >
                                  <div>
                                    <span className="text-xs font-semibold text-white capitalize">
                                      {bill.type}
                                    </span>
                                    <span className="text-[10px] text-[var(--muted-foreground)] ml-2">
                                      Due {bill.dueDate}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs text-[var(--muted-foreground)]">
                                      KES {bill.amount.toLocaleString()}
                                    </span>
                                    <PaymentStatusBadge status={bill.status} />
                                  </div>
                                </div>
                              ))
                            )}
                            {houseBills.length > 0 && (
                              <div
                                className={`flex items-center gap-1.5 mt-1 pt-2 border-t border-[var(--border)] text-xs font-medium ${allClear ? "text-emerald-400" : "text-red-400"}`}
                              >
                                {allClear ? (
                                  <>
                                    <Check size={12} /> All bills settled
                                  </>
                                ) : (
                                  <>
                                    <X size={12} /> {dueBills.length}{" "}
                                    outstanding bill
                                    {dueBills.length > 1 ? "s" : ""}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Notifications ── */}
        {tab === "notifications" && (
          <div className="space-y-5">
            {isAdmin && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  Post Notification
                </h2>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={notifTitle}
                    onChange={(e) => setNotifTitle(e.target.value)}
                    placeholder="Announcement title"
                    className="input-base"
                  />
                  <input
                    type="datetime-local"
                    value={notifDate}
                    onChange={(e) => setNotifDate(e.target.value)}
                    className="input-base"
                  />
                  <textarea
                    value={notifDesc}
                    onChange={(e) => setNotifDesc(e.target.value)}
                    placeholder="Describe the announcement or event in detail…"
                    rows={3}
                    className="input-base resize-none"
                  />
                  <button
                    onClick={async () => {
                      if (!notifTitle || !notifDate || !notifDesc) return;
                      addNotification({
                        estateId: estate.id,
                        title: notifTitle,
                        eventDate: notifDate,
                        description: notifDesc,
                      });
                      try {
                        const result = await apiRequest<{
                          users: { email: string }[];
                        }>(
                          `/users?estateId=${encodeURIComponent(estate.id)}&role=tenant`,
                        );
                        const tenantEmails = result.users.map((u) => u.email);
                        setNotifSentTo(tenantEmails);
                        setTimeout(() => setNotifSentTo([]), 8000);
                      } catch (error) {
                        console.warn(
                          "Failed to load tenant emails from backend:",
                          error,
                        );
                        setNotifSentTo([]);
                      }
                      setNotifTitle("");
                      setNotifDate("");
                      setNotifDesc("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                  >
                    Post Notification
                  </button>
                  {notifSentTo.length > 0 && (
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 space-y-1.5">
                      <p className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check size={13} /> Notification posted · email dispatch
                        queued for {notifSentTo.length} tenant
                        {notifSentTo.length > 1 ? "s" : ""}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {notifSentTo.map((email) => (
                          <span
                            key={email}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300"
                          >
                            {email}
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                        Email delivery will be enabled when the backend is
                        connected.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {estateNotifs.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <Bell size={32} className="mx-auto mb-3 opacity-30" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              estateNotifs.map((n) => (
                <div key={n.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {n.title}
                      </h3>
                      <p className="text-xs text-blue-400 mb-2">
                        📅 {new Date(n.eventDate).toLocaleString()}
                      </p>
                      <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                        {n.description}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        Posted: {n.createdAt}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="text-red-400 hover:text-red-300 transition-colors shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Maintenance ── */}
        {tab === "maintenance" && (
          <div className="space-y-5">
            {isAdmin && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  Post Maintenance
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={maintTitle}
                    onChange={(e) => setMaintTitle(e.target.value)}
                    placeholder="Issue title"
                    className="input-base"
                  />
                  <select
                    value={maintStatus}
                    onChange={(e) =>
                      setMaintStatus(e.target.value as MaintenanceStatus)
                    }
                    className="input-base"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <textarea
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    placeholder="Description…"
                    rows={2}
                    className="input-base resize-none sm:col-span-2"
                  />
                  <button
                    onClick={() => {
                      if (!maintTitle || !maintDesc) return;
                      addMaintenance({
                        estateId: estate.id,
                        title: maintTitle,
                        description: maintDesc,
                        status: maintStatus,
                      });
                      setMaintTitle("");
                      setMaintDesc("");
                      setMaintStatus("scheduled");
                    }}
                    className="sm:col-span-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                  >
                    Post Issue
                  </button>
                </div>
              </div>
            )}
            {estateMaintenance.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <Wrench size={32} className="mx-auto mb-3 opacity-30" />
                <p>No maintenance items.</p>
              </div>
            ) : (
              estateMaintenance.map((m) => (
                <div key={m.id} className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white mb-1">
                        {m.title}
                      </h3>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        {m.description}
                      </p>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        {m.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isAdmin ? (
                        <select
                          value={m.status}
                          onChange={(e) =>
                            updateMaintenanceStatus(
                              m.id,
                              e.target.value as MaintenanceStatus,
                            )
                          }
                          className="text-xs rounded-full border px-2 py-0.5 bg-transparent cursor-pointer focus:outline-none"
                          style={{
                            borderColor: "rgba(37,99,235,0.3)",
                            color:
                              m.status === "resolved"
                                ? "#6ee7b7"
                                : m.status === "in_progress"
                                  ? "#fbbf24"
                                  : "#93c5fd",
                          }}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      ) : (
                        <MaintenanceBadge status={m.status} />
                      )}
                      {isAdmin && (
                        <button
                          onClick={() => deleteMaintenance(m.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Payments ── */}
        {tab === "payments" && (
          <div className="space-y-5">
            {isAdmin && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  Add Payment Option
                </h2>
                <div className="flex gap-3 flex-wrap">
                  <input
                    type="text"
                    value={payOptMethod}
                    onChange={(e) => setPayOptMethod(e.target.value)}
                    placeholder="Method (e.g. M-Pesa Paybill)"
                    className="input-base flex-1 min-w-48"
                  />
                  <input
                    type="text"
                    value={payOptDetails}
                    onChange={(e) => setPayOptDetails(e.target.value)}
                    placeholder="Details (e.g. Paybill: 880100)"
                    className="input-base flex-1 min-w-48"
                  />
                  <button
                    onClick={() => {
                      if (!payOptMethod || !payOptDetails) return;
                      addPaymentOption({
                        estateId: estate.id,
                        method: payOptMethod,
                        details: payOptDetails,
                      });
                      setPayOptMethod("");
                      setPayOptDetails("");
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Payment options */}
            {estatePayOpts.length > 0 && (
              <div>
                <h2 className="text-sm font-bold text-white mb-3">
                  Payment Methods
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {estatePayOpts.map((opt) => (
                    <div
                      key={opt.id}
                      className="glass-card rounded-xl p-4 flex items-start justify-between gap-3"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {opt.method}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                          {opt.details}
                        </p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => removePaymentOption(opt.id)}
                          className="text-red-400 hover:text-red-300 shrink-0 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bills */}
            <div>
              <h2 className="text-sm font-bold text-white mb-3">
                {isAdmin ? "All Payments" : "My Bills"}
              </h2>
              {(isAdmin ? estatePayments : myPayments).length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">
                  No payment records.
                </p>
              ) : isAdmin ? (
                /* Admin: flat list with Mark Paid */
                <div className="space-y-3">
                  {estatePayments.map((pay) => (
                    <div
                      key={pay.id}
                      className="glass-card rounded-xl p-4 flex items-center justify-between gap-3 flex-wrap"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-semibold text-white capitalize">
                            {pay.type}
                          </span>
                          <PaymentStatusBadge status={pay.status} />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Due: {pay.dueDate} · KES {pay.amount.toLocaleString()}
                        </p>
                        {pay.paidAt && (
                          <p className="text-xs text-emerald-400">
                            Paid: {new Date(pay.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {pay.status !== "confirmed" && (
                          <button
                            onClick={() =>
                              updatePaymentStatus(pay.id, "confirmed")
                            }
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 transition-all"
                          >
                            Mark Paid
                          </button>
                        )}
                        {pay.status === "confirmed" && (
                          <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white border border-[var(--border)] transition-all">
                            <Download size={11} /> Receipt
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                (() => {
                  /* Tenant: summary card + Pay Now flow */
                  const dueBills = myPayments.filter((p) => p.status === "due");
                  const allPaid =
                    myPayments.length > 0 && dueBills.length === 0;
                  const typeIcon = (t: string) =>
                    t === "rent" ? "🏠" : t === "water" ? "💧" : "⚡";
                  const typeLabel = (t: string) =>
                    t === "rent"
                      ? "Rent"
                      : t === "water"
                        ? "Water"
                        : "Electricity";
                  const activePay = myPayments.find((p) => p.id === payingId);
                  return (
                    <div className="space-y-4">
                      {/* Summary + Pay Now */}
                      <div className="glass-card rounded-2xl p-5">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <div>
                            <p className="text-sm font-semibold text-white mb-0.5">
                              Bill Summary
                            </p>
                            {allPaid ? (
                              <p className="text-xs text-emerald-400 flex items-center gap-1">
                                <Check size={11} /> All bills settled
                              </p>
                            ) : (
                              <p className="text-xs text-red-400">
                                {dueBills.length} outstanding bill
                                {dueBills.length > 1 ? "s" : ""}
                              </p>
                            )}
                          </div>
                          {dueBills.length > 0 && (
                            <button
                              onClick={() => {
                                if (payingId) {
                                  setPayingId(null);
                                  setPayInput("");
                                  setPayError("");
                                } else {
                                  setPayingId("selector");
                                  setPayInput("");
                                  setPayError("");
                                  setPaySuccess(null);
                                }
                              }}
                              className="px-5 py-2 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all shrink-0"
                            >
                              {payingId ? "Cancel" : "Pay Now"}
                            </button>
                          )}
                        </div>

                        {/* Bill selector — shown when Pay Now is clicked */}
                        {payingId === "selector" && (
                          <div className="border-t border-[var(--border)] pt-4 space-y-3">
                            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest">
                              Choose a bill to pay
                            </p>
                            <div className="space-y-2">
                              {dueBills.map((bill) => (
                                <button
                                  key={bill.id}
                                  onClick={() => {
                                    setPayingId(bill.id);
                                    setPayInput("");
                                    setPayError("");
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left group"
                                >
                                  <span className="text-lg">
                                    {typeIcon(bill.type)}
                                  </span>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-white">
                                      {typeLabel(bill.type)} Bill
                                    </p>
                                    <p className="text-xs text-[var(--muted-foreground)]">
                                      KES {bill.amount.toLocaleString()} · Due{" "}
                                      {bill.dueDate}
                                    </p>
                                  </div>
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20 group-hover:bg-[var(--accent)]/15 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all">
                                    Due
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Payment form — shown after selecting a specific bill */}
                        {payingId && payingId !== "selector" && activePay && (
                          <div className="border-t border-[var(--border)] pt-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">
                                {typeIcon(activePay.type)}
                              </span>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  Paying {typeLabel(activePay.type)} Bill
                                </p>
                                <p className="text-xs text-[var(--muted-foreground)]">
                                  KES {activePay.amount.toLocaleString()} · Due{" "}
                                  {activePay.dueDate}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setPayingId("selector");
                                  setPayInput("");
                                  setPayError("");
                                }}
                                className="ml-auto text-[var(--muted-foreground)] hover:text-white transition-colors text-xs underline"
                              >
                                Change
                              </button>
                            </div>

                            {estatePayOpts.length > 0 && (
                              <div className="grid sm:grid-cols-2 gap-2">
                                {estatePayOpts.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--muted)]/60 border border-[var(--border)]"
                                  >
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                                    <div>
                                      <p className="text-xs font-semibold text-white">
                                        {opt.method}
                                      </p>
                                      <p className="text-[10px] text-[var(--muted-foreground)]">
                                        {opt.details}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                              <p className="text-xs text-amber-300 font-medium">
                                Enter exact amount:{" "}
                                <span className="font-bold text-white">
                                  KES {activePay.amount.toLocaleString()}
                                </span>
                              </p>
                              <p className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
                                Partial payments are not accepted.
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <div className="flex-1">
                                <div className="flex rounded-[var(--radius)] overflow-hidden border border-[var(--border)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_rgba(37,99,235,0.15)] transition-all">
                                  <span className="flex items-center px-3 bg-[var(--muted)]/80 text-xs font-semibold text-[var(--muted-foreground)] border-r border-[var(--border)] select-none whitespace-nowrap">
                                    KES
                                  </span>
                                  <input
                                    type="number"
                                    value={payInput}
                                    onChange={(e) => {
                                      setPayInput(e.target.value);
                                      setPayError("");
                                    }}
                                    placeholder={activePay.amount.toString()}
                                    className="flex-1 bg-[var(--muted)] text-[var(--foreground)] text-sm px-3 py-2.5 outline-none placeholder:text-[var(--muted-foreground)] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    min={1}
                                  />
                                </div>
                                {payError && (
                                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                                    <X size={11} /> {payError}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => {
                                  const entered = Number(payInput);
                                  if (
                                    !payInput ||
                                    isNaN(entered) ||
                                    entered <= 0
                                  ) {
                                    setPayError(
                                      "Please enter the payment amount.",
                                    );
                                    return;
                                  }
                                  if (entered !== activePay.amount) {
                                    setPayError(
                                      `Incorrect amount. You must pay exactly KES ${activePay.amount.toLocaleString()}.`,
                                    );
                                    return;
                                  }
                                  updatePaymentStatus(
                                    activePay.id,
                                    "confirmed",
                                  );
                                  setPayingId(null);
                                  setPayInput("");
                                  setPayError("");
                                  setPaySuccess(activePay.id);
                                  setTimeout(() => setPaySuccess(null), 4000);
                                }}
                                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-all whitespace-nowrap"
                              >
                                Confirm Payment
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* All bills list */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-widest px-1">
                          All Bills
                        </p>
                        {myPayments.map((pay) => (
                          <div
                            key={pay.id}
                            className={`glass-card rounded-xl p-4 flex items-center gap-3 ${paySuccess === pay.id ? "border border-emerald-500/30" : ""}`}
                          >
                            <span className="text-xl">
                              {typeIcon(pay.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                <span className="text-sm font-semibold text-white">
                                  {typeLabel(pay.type)}
                                </span>
                                <PaymentStatusBadge status={pay.status} />
                                {paySuccess === pay.id && (
                                  <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    Just paid
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[var(--muted-foreground)]">
                                KES {pay.amount.toLocaleString()} · Due{" "}
                                {pay.dueDate}
                              </p>
                              {pay.paidAt && (
                                <p className="text-xs text-emerald-400">
                                  Paid{" "}
                                  {new Date(pay.paidAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            {pay.status === "confirmed" && (
                              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-white border border-[var(--border)] transition-all shrink-0">
                                <Download size={11} /> Receipt
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {tab === "inquiries" && (
          <div className="space-y-5">
            {/* Tenant: submit form */}
            {!isAdmin && (
              <div className="glass-card rounded-2xl p-6">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Plus size={16} className="text-blue-400" />
                  Submit Inquiry
                </h2>
                <div className="flex gap-3">
                  <textarea
                    value={inqMsg}
                    onChange={(e) => setInqMsg(e.target.value)}
                    placeholder="Describe your inquiry or issue…"
                    rows={2}
                    className="input-base resize-none flex-1"
                  />
                  <button
                    onClick={() => {
                      if (!inqMsg.trim()) return;
                      const myHouse = houses.find(
                        (h) => h.estateId === estate.id,
                      );
                      addInquiry({
                        estateId: estate.id,
                        tenantId: user.id,
                        houseId: myHouse?.id || "",
                        message: inqMsg.trim(),
                      });
                      setInqMsg("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:bg-blue-500 btn-glow transition-all"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}

            {/* Admin: read-only notice */}
            {isAdmin && (
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--muted)]/40 border border-[var(--border)]">
                <MessageSquare size={14} className="text-blue-400 shrink-0" />
                <p className="text-xs text-[var(--muted-foreground)]">
                  Viewing all tenant inquiries for this estate — read only.
                </p>
              </div>
            )}

            {estateInquiries.length === 0 ? (
              <div className="text-center py-12 text-[var(--muted-foreground)]">
                <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
                <p>No inquiries yet.</p>
              </div>
            ) : (
              estateInquiries.map((inq) => {
                const isOwn = inq.tenantId === user.id;
                const unitNumber =
                  houses.find((h) => h.id === inq.houseId)?.houseNumber || "—";
                return (
                  <div
                    key={inq.id}
                    className={`glass-card rounded-2xl p-5 ${isOwn && !isAdmin ? "border-blue-500/20" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="text-sm font-semibold text-white">
                            Unit {unitNumber}
                          </span>
                          {isOwn && !isAdmin && (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/20">
                              Mine
                            </span>
                          )}
                          <InquiryBadge status={inq.status} />
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          {new Date(inq.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--foreground)] mb-3 bg-[var(--muted)]/40 rounded-xl px-3 py-2.5">
                      {inq.message}
                    </p>
                    {inq.reply && (
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2.5">
                        <p className="text-xs font-semibold text-blue-400 mb-1">
                          Admin Reply ·{" "}
                          {inq.repliedAt
                            ? new Date(inq.repliedAt).toLocaleString()
                            : ""}
                        </p>
                        <p className="text-sm text-[var(--foreground)]">
                          {inq.reply}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
