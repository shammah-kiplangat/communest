import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronDown, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { ImageUpload, MultiImageUpload } from "../components/ImageUpload";
import Footer from "../components/Footer";
const HERO_BG =
  "https://static.vecteezy.com/system/resources/thumbnails/069/793/065/small/modern-homes-sunset-family-bikes-pathway-suburban-life-real-estate-marketing-free-photo.jpg";

const COUNTIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Kiambu",
  "Thika",
  "Machakos",
  "Meru",
  "Nyeri",
  "Kakamega",
  "Garissa",
  "Kilifi",
  "Embu",
  "Nyahururu",
  "Kericho",
  "Homa Bay",
  "Bungoma",
  "Malindi",
  "Nanyuki",
];

function validateTitleDeed(val: string): boolean {
  return /^TNRD\/[A-Z]+\/\d{4}\/\d{5}$/.test(val);
}
function validatePhone(p: string): boolean {
  return /^\+254\d{9}$/.test(p);
}
function validateEmail(e: string): boolean {
  return /^[^\s@]+@(gmail\.com|email\.com)$/.test(e);
}

export default function ListYourEstatePage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { addEstate } = useData();
  const navigate = useNavigate();

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Estate info
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [county, setCounty] = useState("");
  const [units, setUnits] = useState("");
  const [totalArea, setTotalArea] = useState("");
  const [description, setDescription] = useState("");

  // Management
  const [mgmtName, setMgmtName] = useState("");
  const [mgmtEmail, setMgmtEmail] = useState("");
  const [mgmtPhone, setMgmtPhone] = useState("");

  // Legal
  const [titleDeed, setTitleDeed] = useState("");

  // Photos (uploaded files → base64)
  const [estatePhoto, setEstatePhoto] = useState("");
  const [amenityPhotos, setAmenityPhotos] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <AlertCircle size={40} className="text-amber-400" />
        <h2 className="text-xl font-bold text-white">Sign In Required</h2>
        <p className="text-[var(--muted-foreground)] text-sm text-center">
          You need to be signed in as a Regular User or Estate Admin to list an
          estate.
        </p>
        <Link
          to="/auth"
          className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (user?.role !== "regular_user" && user?.role !== "estate_admin") {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-xl font-bold text-white">Access Restricted</h2>
        <p className="text-[var(--muted-foreground)] text-sm text-center">
          Only Regular Users and Estate Admins can access this page.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
        >
          Go Back
        </button>
      </div>
    );
  }

  function validate(): string {
    if (name.trim().length < 4 || name.trim().length > 20)
      return "Estate name must be 4–20 characters.";
    if (location.trim().length < 4 || location.trim().length > 20)
      return "Location must be 4–20 characters.";
    if (!county) return "Please select a county.";
    const u = Number(units);
    if (isNaN(u) || u < 1 || u > 1000)
      return "Units must be between 1 and 1000.";
    const area = Number(totalArea);
    if (isNaN(area) || area < 1 || area > 999999)
      return "Total area must be 1–999,999 m².";
    if (mgmtName.trim().length < 4 || mgmtName.trim().length > 20)
      return "Management name must be 4–20 characters.";
    if (!validateEmail(mgmtEmail))
      return "Management email must end with @gmail.com or @email.com.";
    if (!validatePhone(mgmtPhone))
      return "Phone must start with +254 followed by 9 digits.";
    if (!validateTitleDeed(titleDeed))
      return "Title deed must follow format: TNRD/COUNTY/YEAR/12345 (e.g. TNRD/NAIROBI/2020/12345).";
    if (!estatePhoto) return "Please upload an estate photo.";
    if (!termsAccepted)
      return "You must accept the Terms & Conditions and Privacy Policy.";
    return "";
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError("");
    const newEstateId = addEstate({
      name: name.trim(),
      location: location.trim(),
      county,
      units: Number(units),
      totalArea: Number(totalArea),
      description: description.trim(),
      managementName: mgmtName.trim(),
      managementEmail: mgmtEmail,
      managementPhone: mgmtPhone,
      titleDeedNumber: titleDeed.trim(),
      estatePhoto,
      amenityPhotos,
      adminId: user!.id,
    });
    // Promote the listing user to estate admin for this estate
    updateUser({ role: "estate_admin", estateId: newEstateId });
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">
              Submitted for Approval!
            </h2>
            <p className="text-[var(--muted-foreground)] mb-8 leading-relaxed">
              Your estate <strong className="text-white">{name}</strong> has
              been submitted for review by the Communest Admin. You'll receive
              an email notification once it's approved. This usually takes 24–48
              hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                to="/explore"
                className="px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:bg-blue-500 btn-glow transition-all"
              >
                Explore Estates
              </Link>
              <Link
                to="/"
                className="px-6 py-2.5 rounded-xl border border-[var(--border)] text-white font-semibold hover:bg-white/5 transition-all"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative pt-28 pb-16 flex flex-col items-center text-center">
        <img
          src={HERO_BG}
          alt="List your estate"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-3">
            For Estate Owners
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            List Your Estate
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            Join hundreds of estate owners who trust Communest to connect them
            with quality tenants. List your estate today and start managing it
            effortlessly.
          </p>
        </div>
      </section>

      {/* Form */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Estate info */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--accent)]/20 text-blue-400 text-sm font-bold flex items-center justify-center">
                1
              </span>
              Estate Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Estate Name *{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (4–20 chars)
                  </span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Green Valley Estate"
                  className="input-base"
                  minLength={4}
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Location *{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (4–20 chars)
                  </span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Westlands"
                  className="input-base"
                  minLength={4}
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  County *
                </label>
                <div className="relative">
                  <select
                    value={county}
                    onChange={(e) => setCounty(e.target.value)}
                    className="input-base appearance-none pr-8"
                    required
                  >
                    <option value="">Select a county…</option>
                    {COUNTIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] pointer-events-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Number of Units *{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (1–1000)
                  </span>
                </label>
                <input
                  type="number"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  placeholder="48"
                  className="input-base"
                  min={1}
                  max={1000}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Total Area (m²) *{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (1–999,999)
                  </span>
                </label>
                <input
                  type="number"
                  value={totalArea}
                  onChange={(e) => setTotalArea(e.target.value)}
                  placeholder="3200"
                  className="input-base"
                  min={1}
                  max={999999}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Description{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (optional)
                  </span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your estate — amenities, surroundings, community features…"
                  rows={3}
                  className="input-base resize-none"
                />
              </div>
            </div>
          </section>

          {/* Management */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--accent)]/20 text-blue-400 text-sm font-bold flex items-center justify-center">
                2
              </span>
              Management Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Management Name *{" "}
                  <span className="text-[var(--muted-foreground)]">
                    (4–20 chars)
                  </span>
                </label>
                <input
                  type="text"
                  value={mgmtName}
                  onChange={(e) => setMgmtName(e.target.value)}
                  placeholder="Green Valley Mgmt"
                  className="input-base"
                  minLength={4}
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Management Email *
                </label>
                <input
                  type="email"
                  value={mgmtEmail}
                  onChange={(e) => setMgmtEmail(e.target.value)}
                  placeholder="info@estate.co.ke"
                  className="input-base"
                  required
                />
                {mgmtEmail && !validateEmail(mgmtEmail) && (
                  <p className="text-xs text-red-400 mt-1">
                    Must end with @gmail.com or @email.com
                  </p>
                )}
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                  Management Phone *
                </label>
                <input
                  type="tel"
                  value={mgmtPhone}
                  onChange={(e) => setMgmtPhone(e.target.value)}
                  placeholder="+254712345678"
                  className="input-base"
                  required
                />
                {mgmtPhone && !validatePhone(mgmtPhone) && (
                  <p className="text-xs text-red-400 mt-1">
                    Must start with +254 followed by 9 digits
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Legal */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--accent)]/20 text-blue-400 text-sm font-bold flex items-center justify-center">
                3
              </span>
              Legal Documentation
            </h2>
            <div>
              <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1.5">
                Title Deed Number *{" "}
                <span className="text-[var(--muted-foreground)]">
                  (Format: TNRD/COUNTY/YEAR/12345)
                </span>
              </label>
              <input
                type="text"
                value={titleDeed}
                onChange={(e) => setTitleDeed(e.target.value.toUpperCase())}
                placeholder="TNRD/NAIROBI/2020/12345"
                className="input-base font-mono"
                required
              />
              {titleDeed && !validateTitleDeed(titleDeed) && (
                <p className="text-xs text-amber-400 mt-1">
                  Format: TNRD/NAIROBI/2020/12345
                </p>
              )}
            </div>
          </section>

          {/* Photos */}
          <section className="glass-card rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-[var(--accent)]/20 text-blue-400 text-sm font-bold flex items-center justify-center">
                4
              </span>
              Photos
            </h2>
            <div className="space-y-5">
              <ImageUpload
                value={estatePhoto}
                onChange={setEstatePhoto}
                onClear={() => setEstatePhoto("")}
                label="Estate Photo"
                required
                hint="(1 photo — will appear on the Explore page)"
                previewHeight="h-52"
              />
              <MultiImageUpload
                values={amenityPhotos}
                onChange={setAmenityPhotos}
                label="Amenity Photos"
                hint="(optional — up to 10 photos)"
                max={10}
              />
            </div>
          </section>

          {/* Terms */}
          <section className="glass-card rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="estate-terms"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-blue-600"
                required
              />
              <label
                htmlFor="estate-terms"
                className="text-sm text-[var(--muted-foreground)] leading-relaxed"
              >
                I confirm that all information provided is accurate and I agree
                to the{" "}
                <Link
                  to="/terms"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy-policy"
                  target="_blank"
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Privacy Policy
                </Link>{" "}
                of Communest.
              </label>
            </div>
          </section>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-[var(--accent)] text-white font-bold text-base hover:bg-blue-500 btn-glow transition-all"
          >
            Submit for Approval
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}
