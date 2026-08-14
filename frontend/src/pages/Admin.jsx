import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, LogOut, Phone, Mail, Trash2, Bike, CalendarClock, Bell, Globe } from "lucide-react";
import {
  adminLogin, adminGoogleSession, adminLogout, adminMe, adminGetBookings, adminGetEnquiries,
  adminUpdateBooking, adminUpdateEnquiry, adminDeleteBooking, adminDeleteEnquiry,
} from "@/lib/api";

const TOKEN_KEY = "lm_admin_token";
const LANG_KEY = "lm_admin_lang";

const STR = {
  en: {
    workshopAdmin: "Workshop admin",
    email: "Email",
    password: "Password",
    signIn: "Sign in",
    signingIn: "Signing in…",
    or: "or",
    google: "Continue with Google",
    googleNote: "Google sign-in only works with the shop's registered admin email.",
    backHome: "← Back to the site",
    bookings: "Bookings",
    enquiries: "Enquiries",
    bookingKind: "booking",
    enquiryKind: "enquiry",
    refresh: "Refresh",
    loading: "Loading…",
    nothingHere: "Nothing here yet",
    nothingSub: (tab) => `New ${tab} from the website will show up here.`,
    newRequests: "New requests",
    allCaughtUp: "All caught up — nothing new.",
    logOut: "Log out",
    new: "new",
    contacted: "contacted",
    done: "done",
    markContacted: "Mark contacted",
    markDone: "Mark done",
    reopen: "Reopen",
    deleteLabel: "Delete",
    confirmDelete: "Delete this request for good?",
    markedAs: (s) => `Marked as ${s}.`,
    deleted: "Deleted.",
    errUpdate: "Couldn't update that — try again.",
    errDelete: "Couldn't delete that — try again.",
    errLoad: "Couldn't load the latest requests.",
    loginFailed: "Login failed. Check your details.",
    googleFailed: "Google sign-in failed.",
    prefers: "Prefers:",
    appointment: "Appointment date",
    reminderAuto: "Reminder email goes out the day before",
    reminderSent: "Reminder sent ✓",
    newCount: (n) => `${n} new`,
  },
  fr: {
    workshopAdmin: "Administration atelier",
    email: "E-mail",
    password: "Mot de passe",
    signIn: "Se connecter",
    signingIn: "Connexion…",
    or: "ou",
    google: "Continuer avec Google",
    googleNote: "La connexion Google ne fonctionne qu'avec l'adresse e-mail admin enregistrée de l'atelier.",
    backHome: "← Retour au site",
    bookings: "Réservations",
    enquiries: "Demandes",
    bookingKind: "réservation",
    enquiryKind: "demande",
    refresh: "Actualiser",
    loading: "Chargement…",
    nothingHere: "Rien ici pour le moment",
    nothingSub: (tab) => `Les nouvelles ${tab === "bookings" ? "réservations" : "demandes"} du site apparaîtront ici.`,
    newRequests: "Nouvelles demandes",
    allCaughtUp: "Tout est à jour — rien de nouveau.",
    logOut: "Se déconnecter",
    new: "nouveau",
    contacted: "contacté",
    done: "terminé",
    markContacted: "Marquer contacté",
    markDone: "Marquer terminé",
    reopen: "Rouvrir",
    deleteLabel: "Supprimer",
    confirmDelete: "Supprimer définitivement cette demande ?",
    markedAs: (s) => `Marqué comme ${s}.`,
    deleted: "Supprimé.",
    errUpdate: "Impossible de mettre à jour — réessayez.",
    errDelete: "Impossible de supprimer — réessayez.",
    errLoad: "Impossible de charger les dernières demandes.",
    loginFailed: "Échec de la connexion. Vérifiez vos identifiants.",
    googleFailed: "Échec de la connexion Google.",
    prefers: "Préfère :",
    appointment: "Date du rendez-vous",
    reminderAuto: "E-mail de rappel envoyé automatiquement la veille",
    reminderSent: "Rappel envoyé ✓",
    newCount: (n) => `${n} nouveaux`,
  },
};

const statusStyles = {
  new: "border-[#D35400] text-[#E67E22] bg-[#D35400]/10",
  contacted: "border-[#F39C12]/60 text-[#F39C12] bg-[#F39C12]/10",
  done: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
};

const GoogleMark = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.2 1.64l3.12-3.12C17.46 1.8 14.96.72 12 .72 7.44.72 3.52 3.4 1.76 7.28l3.66 2.84C6.32 7.14 8.9 5.04 12 5.04z" />
    <path fill="#4285F4" d="M23.28 12.26c0-.92-.08-1.6-.26-2.3H12v4.34h6.44c-.13 1.08-.83 2.7-2.39 3.8l3.56 2.76c2.14-1.98 3.67-4.9 3.67-8.6z" />
    <path fill="#FBBC05" d="M5.44 14.3a7.06 7.06 0 0 1 0-4.56L1.78 6.9a11.32 11.32 0 0 0 0 10.24l3.66-2.84z" />
    <path fill="#34A853" d="M12 23.28c3.04 0 5.6-1 7.46-2.72l-3.56-2.76c-.95.64-2.23 1.1-3.9 1.1-3.1 0-5.68-2.1-6.58-4.9l-3.64 2.82c1.75 3.5 5.34 6.46 10.22 6.46z" />
  </svg>
);

const LangToggle = ({ lang, onToggle, testid }) => (
  <button
    data-testid={testid}
    onClick={onToggle}
    aria-label="Switch language"
    className="mono-label flex items-center gap-2 text-[#A1A1AA] hover:text-[#E67E22] border border-white/20 hover:border-[#D35400] px-3 py-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
  >
    <Globe size={14} />
    {lang === "en" ? "FR" : "EN"}
  </button>
);

const StatusChip = ({ status, t, testid }) => (
  <span data-testid={testid} className={`mono-label px-3 py-1 border ${statusStyles[status] || statusStyles.new}`}>
    {t[status] || status}
  </span>
);

const ActionButton = ({ onClick, testid, children, danger }) => (
  <button
    data-testid={testid}
    onClick={onClick}
    className={`mono-label px-3 py-2 border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400] ${
      danger
        ? "border-red-900/60 text-red-400 hover:bg-red-500/10"
        : "border-white/20 text-[#A1A1AA] hover:border-[#D35400] hover:text-[#E67E22]"
    }`}
  >
    {children}
  </button>
);

const AdminPage = () => {
  const location = useLocation();
  const isOAuthCallback = location.hash?.includes("session_id=");
  const oauthHandled = useRef(false);

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [oauthError, setOauthError] = useState("");
  const [oauthProcessing, setOauthProcessing] = useState(isOAuthCallback);
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "en");

  const t = STR[lang];

  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  };

  const logout = useCallback(() => {
    const tk = localStorage.getItem(TOKEN_KEY);
    if (tk) adminLogout(tk).catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthed(false);
  }, []);

  const loadData = useCallback(async (tk) => {
    setLoading(true);
    try {
      const [b, e] = await Promise.all([adminGetBookings(tk), adminGetEnquiries(tk)]);
      setBookings(b.data);
      setEnquiries(e.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else toast.error(STR[localStorage.getItem(LANG_KEY) || "en"].errLoad);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!isOAuthCallback || oauthHandled.current) return;
    oauthHandled.current = true;
    const sessionId = location.hash.split("session_id=")[1]?.split("&")[0];
    adminGoogleSession(sessionId)
      .then(({ data }) => {
        localStorage.setItem(TOKEN_KEY, data.token);
        window.history.replaceState(null, "", "/admin");
        setToken(data.token);
      })
      .catch((err) => {
        const detail = err.response?.data?.detail;
        setOauthError(typeof detail === "string" ? detail : STR[localStorage.getItem(LANG_KEY) || "en"].googleFailed);
        window.history.replaceState(null, "", "/admin");
      })
      .finally(() => setOauthProcessing(false));
  }, [isOAuthCallback, location.hash]);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setChecking(false); return; }
      try {
        await adminMe(token);
        setAuthed(true);
        await loadData(token);
      } catch {
        logout();
      } finally {
        setChecking(false);
      }
    };
    verify();
  }, [token, loadData, logout]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const { data } = await adminLogin(email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      setToken(data.token);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === "string" ? detail : t.loginFailed);
    } finally {
      setSending(false);
    }
  };

  const handleGoogleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + "/admin";
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  const setStatus = async (kind, id, status) => {
    try {
      if (kind === "booking") {
        const { data } = await adminUpdateBooking(token, id, { status });
        setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
      } else {
        const { data } = await adminUpdateEnquiry(token, id, status);
        setEnquiries((prev) => prev.map((b) => (b.id === id ? data : b)));
      }
      toast.success(t.markedAs(t[status] || status));
    } catch {
      toast.error(t.errUpdate);
    }
  };

  const setAppointment = async (id, dateStr) => {
    try {
      const { data } = await adminUpdateBooking(token, id, { appointment_date: dateStr });
      setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
      toast.success(t.markedAs(dateStr || "—"));
    } catch {
      toast.error(t.errUpdate);
    }
  };

  const remove = async (kind, id) => {
    if (!window.confirm(t.confirmDelete)) return;
    try {
      if (kind === "booking") {
        await adminDeleteBooking(token, id);
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        await adminDeleteEnquiry(token, id);
        setEnquiries((prev) => prev.filter((b) => b.id !== id));
      }
      toast.success(t.deleted);
    } catch {
      toast.error(t.errDelete);
    }
  };

  const jumpTo = (n) => {
    setTab(n.kind === "booking" ? "bookings" : "enquiries");
    setShowNotifs(false);
    setTimeout(() => document.getElementById(`req-${n.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  };

  if (oauthProcessing || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="admin-loading">
        <Loader2 size={28} className="animate-spin text-[#D35400]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6" data-testid="admin-login-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-[#121212] border border-white/10 p-10"
        >
          <div className="absolute top-5 right-5">
            <LangToggle lang={lang} onToggle={toggleLang} testid="admin-lang-toggle" />
          </div>
          <img src="/logo.png" alt="Local Moto" className="h-12 w-auto mb-2" data-testid="admin-login-logo" />
          <p className="mono-label text-[#52525B] mb-10">{t.workshopAdmin}</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-6" data-testid="admin-login-form">
            <div>
              <label htmlFor="admin-email" className="mono-label text-[#52525B] block mb-3">{t.email}</label>
              <input id="admin-email" data-testid="admin-email-input" type="email" required className="input-industrial" placeholder="admin@localmoto.co.uk"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="admin-password" className="mono-label text-[#52525B] block mb-3">{t.password}</label>
              <input id="admin-password" data-testid="admin-password-input" type="password" required className="input-industrial" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>}
            <button type="submit" data-testid="admin-login-submit" disabled={sending} className="btn-accent w-full disabled:opacity-60">
              {sending ? <Loader2 size={16} className="animate-spin" /> : null}
              {sending ? t.signingIn : t.signIn}
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <span className="h-px flex-1 bg-white/10" />
            <span className="mono-label text-[#52525B]">{t.or}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            data-testid="admin-google-login"
            onClick={handleGoogleLogin}
            className="btn-ghost w-full"
          >
            <GoogleMark />
            {t.google}
          </button>
          {oauthError && <p className="text-red-400 text-sm mt-4" data-testid="admin-google-error">{oauthError}</p>}
          <p className="text-[#52525B] text-xs mt-4 leading-relaxed">{t.googleNote}</p>

          <a href="/" data-testid="admin-back-home" className="mono-label text-[#52525B] hover:text-[#E67E22] transition-colors duration-300 block mt-8">
            {t.backHome}
          </a>
        </motion.div>
      </div>
    );
  }

  const items = tab === "bookings" ? bookings : enquiries;
  const newItems = [
    ...bookings.map((b) => ({ ...b, kind: "booking" })),
    ...enquiries.map((e) => ({ ...e, kind: "enquiry" })),
  ]
    .filter((i) => i.status === "new")
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 8);
  const newCount = bookings.filter((b) => b.status === "new").length + enquiries.filter((e) => e.status === "new").length;

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Local Moto" className="h-8 w-auto" data-testid="admin-header-logo" />
            <span className="mono-label text-[#52525B] hidden sm:inline">{t.workshopAdmin}</span>
          </div>
          <div className="flex items-center gap-4">
            <LangToggle lang={lang} onToggle={toggleLang} testid="admin-lang-toggle-dashboard" />
            <div className="relative">
              <button
                data-testid="admin-notif-bell"
                onClick={() => setShowNotifs(!showNotifs)}
                aria-label="Notifications"
                className="relative p-2 text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
              >
                <Bell size={18} />
                {newCount > 0 && (
                  <span data-testid="admin-notif-badge" className="absolute -top-1 -right-1 bg-[#D35400] text-[#F5F5F5] font-mono text-[10px] leading-none min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {newCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifs(false)} data-testid="admin-notif-overlay" />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    data-testid="admin-notif-panel"
                    className="absolute right-0 top-12 z-50 w-80 bg-[#121212] border border-white/10 max-h-[60vh] overflow-y-auto"
                  >
                    <p className="mono-label text-[#52525B] px-5 py-4 border-b border-white/10">{t.newRequests}</p>
                    {newItems.length === 0 ? (
                      <p className="text-[#A1A1AA] text-sm px-5 py-6" data-testid="admin-notif-empty">{t.allCaughtUp}</p>
                    ) : (
                      newItems.map((n) => (
                        <button
                          key={n.id}
                          data-testid={`admin-notif-item-${n.id}`}
                          onClick={() => jumpTo(n)}
                          className="w-full text-left px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
                        >
                          <span className="mono-label text-[#E67E22]">{n.kind === "booking" ? t.bookingKind : t.enquiryKind}</span>
                          <span className="block text-sm text-[#F5F5F5] mt-1">
                            {n.name}{n.kind === "booking" ? ` — ${n.bike_model}` : ""}
                          </span>
                          <span className="block mono-label text-[#52525B] mt-1">{fmtDate(n.created_at)}</span>
                        </button>
                      ))
                    )}
                  </motion.div>
                </>
              )}
            </div>
            <button data-testid="admin-logout-button" onClick={logout}
              className="mono-label text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]">
              <LogOut size={14} /> {t.logOut}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex gap-px bg-white/10 border border-white/10 w-fit" role="tablist">
            <button data-testid="admin-tab-bookings" role="tab" aria-selected={tab === "bookings"} onClick={() => setTab("bookings")}
              className={`mono-label px-6 py-3 transition-colors duration-300 ${tab === "bookings" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              {t.bookings} ({bookings.length})
            </button>
            <button data-testid="admin-tab-enquiries" role="tab" aria-selected={tab === "enquiries"} onClick={() => setTab("enquiries")}
              className={`mono-label px-6 py-3 transition-colors duration-300 ${tab === "enquiries" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              {t.enquiries} ({enquiries.length})
            </button>
          </div>
          <button data-testid="admin-refresh-button" onClick={() => loadData(token)}
            className="mono-label text-[#A1A1AA] hover:text-[#E67E22] border border-white/20 hover:border-[#D35400] px-4 py-2.5 transition-colors duration-300">
            {loading ? t.loading : t.refresh}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="border border-white/10 bg-[#121212] p-16 text-center" data-testid="admin-empty-state">
            <p className="font-display text-3xl text-[#52525B] uppercase">{t.nothingHere}</p>
            <p className="text-[#A1A1AA] text-sm mt-3">{t.nothingSub(tab)}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <motion.article
                key={item.id}
                id={`req-${item.id}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#121212] border border-white/10 border-l-2 border-l-[#D35400] p-6 lg:p-8"
                data-testid={`admin-${tab === "bookings" ? "booking" : "enquiry"}-card-${item.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-display text-2xl text-[#F5F5F5] uppercase">{item.name}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-[#A1A1AA]">
                      {item.phone && (
                        <a href={`tel:${item.phone}`} className="flex items-center gap-1.5 hover:text-[#E67E22] transition-colors duration-300" data-testid={`admin-item-phone-${item.id}`}>
                          <Phone size={13} className="text-[#D35400]" /> {item.phone}
                        </a>
                      )}
                      {item.email && (
                        <a href={`mailto:${item.email}`} className="flex items-center gap-1.5 hover:text-[#E67E22] transition-colors duration-300" data-testid={`admin-item-email-${item.id}`}>
                          <Mail size={13} className="text-[#D35400]" /> {item.email}
                        </a>
                      )}
                      <span className="flex items-center gap-1.5 text-[#52525B]">
                        <CalendarClock size={13} /> {fmtDate(item.created_at)}
                      </span>
                    </div>
                  </div>
                  <StatusChip status={item.status} t={t} testid={`admin-item-status-${item.id}`} />
                </div>

                {tab === "bookings" && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-sm">
                    <span className="flex items-center gap-1.5 text-[#F5F5F5]">
                      <Bike size={14} className="text-[#D35400]" /> {item.bike_model}
                    </span>
                    <span className="mono-label text-[#E67E22] self-center">{item.service_type}</span>
                    {item.preferred_date && <span className="text-[#A1A1AA]">{t.prefers} {item.preferred_date}</span>}
                  </div>
                )}
                {tab === "bookings" && (
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <label className="mono-label text-[#52525B]">{t.appointment}</label>
                    <input
                      type="date"
                      data-testid={`admin-appt-${item.id}`}
                      value={item.appointment_date || ""}
                      onChange={(e) => setAppointment(item.id, e.target.value)}
                      className="input-industrial !w-auto !py-2"
                      style={{ colorScheme: "dark" }}
                    />
                    {item.reminder_sent ? (
                      <span className="mono-label text-emerald-400" data-testid={`admin-reminder-state-${item.id}`}>{t.reminderSent}</span>
                    ) : item.appointment_date ? (
                      <span className="mono-label text-[#A1A1AA]" data-testid={`admin-reminder-state-${item.id}`}>{t.reminderAuto}</span>
                    ) : null}
                  </div>
                )}
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">{tab === "bookings" ? (item.notes || "—") : item.message}</p>

                <div className="flex flex-wrap gap-2">
                  {item.status !== "contacted" && item.status !== "done" && (
                    <ActionButton testid={`admin-mark-contacted-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "contacted")}>
                      {t.markContacted}
                    </ActionButton>
                  )}
                  {item.status !== "done" && (
                    <ActionButton testid={`admin-mark-done-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "done")}>
                      {t.markDone}
                    </ActionButton>
                  )}
                  {item.status !== "new" && (
                    <ActionButton testid={`admin-mark-new-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "new")}>
                      {t.reopen}
                    </ActionButton>
                  )}
                  <ActionButton danger testid={`admin-delete-${item.id}`} onClick={() => remove(tab === "bookings" ? "booking" : "enquiry", item.id)}>
                    <span className="flex items-center gap-1.5"><Trash2 size={12} /> {t.deleteLabel}</span>
                  </ActionButton>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
