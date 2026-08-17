import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, LogOut, Bike, CalendarClock, ArrowRight } from "lucide-react";
import { customerRegister, customerLogin, customerBookings } from "@/lib/api";
import { useLang } from "@/lib/site-lang";

const TOKEN_KEY = "lm_customer_token";
const USER_KEY = "lm_customer_user";

const statusStyles = {
  new: "border-[#D35400] text-[#E67E22] bg-[#D35400]/10",
  contacted: "border-[#F39C12]/60 text-[#F39C12] bg-[#F39C12]/10",
  done: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
};

const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
};

const AccountPage = () => {
  const { t } = useLang();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [authed, setAuthed] = useState(false);
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch { return null; }
  });
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusLabel = { new: t.account.statusNew, contacted: t.account.statusContacted, done: t.account.statusDone };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setAuthed(false);
    setUser(null);
  }, []);

  const loadBookings = useCallback(async (tk) => {
    setLoading(true);
    try {
      const { data } = await customerBookings(tk);
      setBookings(data);
      return true;
    } catch (err) {
      if (err.response?.status === 401) logout();
      return false;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const verify = async () => {
      if (!token) { setChecking(false); return; }
      const ok = await loadBookings(token);
      if (ok) setAuthed(true);
      setChecking(false);
    };
    verify();
  }, [token, loadBookings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const { data } = mode === "login"
        ? await customerLogin(email, password)
        : await customerRegister(name, email, password);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      setToken(data.token);
    } catch (err) {
      const status = err.response?.status;
      setError(status === 409 ? t.account.errExists : t.account.errAuth);
    } finally {
      setSending(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A]" data-testid="account-loading">
        <Loader2 size={28} className="animate-spin text-[#D35400]" />
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] px-6" data-testid="account-login-page">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md bg-[#121212] border border-white/10 p-10"
        >
          <img src="/logo.png" alt="Local Moto" className="h-12 w-auto mb-2" data-testid="account-logo" />
          <p className="mono-label text-[#52525B] mb-8">{t.account.subtitle}</p>

          <div className="flex gap-px bg-white/10 border border-white/10 mb-8 w-fit" role="tablist">
            <button data-testid="account-tab-login" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setError(""); }}
              className={`mono-label px-5 py-2.5 transition-colors duration-300 ${mode === "login" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              {t.account.signInTab}
            </button>
            <button data-testid="account-tab-register" role="tab" aria-selected={mode === "register"} onClick={() => { setMode("register"); setError(""); }}
              className={`mono-label px-5 py-2.5 transition-colors duration-300 ${mode === "register" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              {t.account.registerTab}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6" data-testid="account-auth-form">
            {mode === "register" && (
              <div>
                <label htmlFor="ac-name" className="mono-label text-[#52525B] block mb-3">{t.account.name}</label>
                <input id="ac-name" data-testid="account-name-input" required className="input-industrial" placeholder={t.contact.namePh}
                  value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}
            <div>
              <label htmlFor="ac-email" className="mono-label text-[#52525B] block mb-3">{t.account.email}</label>
              <input id="ac-email" data-testid="account-email-input" type="email" required className="input-industrial" placeholder={t.contact.emailPh}
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="ac-password" className="mono-label text-[#52525B] block mb-3">{t.account.password}</label>
              <input id="ac-password" data-testid="account-password-input" type="password" required minLength={6} className="input-industrial" placeholder={t.account.passwordHint}
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-red-400 text-sm" data-testid="account-error">{error}</p>}
            <button type="submit" data-testid="account-submit-button" disabled={sending} className="btn-accent w-full disabled:opacity-60">
              {sending ? <Loader2 size={16} className="animate-spin" /> : null}
              {sending ? t.account.working : (mode === "login" ? t.account.signIn : t.account.createAccount)}
            </button>
          </form>

          <a href="/" data-testid="account-back-home" className="mono-label text-[#52525B] hover:text-[#E67E22] transition-colors duration-300 block mt-8">
            {t.account.backHome}
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]" data-testid="account-dashboard">
      <header className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="Local Moto" className="h-8 w-auto" />
            {user?.name && <span className="mono-label text-[#52525B] hidden sm:inline">{t.account.hello}, {user.name}</span>}
          </div>
          <button data-testid="account-logout-button" onClick={logout}
            className="mono-label text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]">
            <LogOut size={14} /> {t.account.logout}
          </button>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <h1 className="font-display uppercase text-4xl md:text-5xl text-[#F5F5F5]" data-testid="account-title">{t.account.myBookings}</h1>
          <a href="/#contact" data-testid="account-book-new"
            className="mono-label text-[#F5F5F5] bg-[#D35400] hover:bg-[#E67E22] px-5 py-3 transition-colors duration-300 inline-flex items-center gap-2">
            {t.account.bookNew} <ArrowRight size={14} />
          </a>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-[#D35400]" /></div>
        ) : bookings.length === 0 ? (
          <div className="border border-white/10 bg-[#121212] p-16 text-center" data-testid="account-empty-state">
            <p className="font-display text-3xl text-[#52525B] uppercase">{t.account.noBookings}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map((b) => (
              <motion.article
                key={b.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#121212] border border-white/10 border-l-2 border-l-[#D35400] p-6 lg:p-8"
                data-testid={`account-booking-${b.id}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-2xl text-[#F5F5F5] uppercase flex items-center gap-3">
                      <Bike size={20} className="text-[#D35400]" /> {b.bike_model}
                    </p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-sm text-[#A1A1AA]">
                      <span className="mono-label text-[#E67E22] self-center">{b.service_type}</span>
                      {b.appointment_date && (
                        <span className="flex items-center gap-1.5" data-testid={`account-appt-${b.id}`}>
                          <CalendarClock size={13} className="text-[#D35400]" /> {t.account.appointment}: {fmtDate(b.appointment_date)}
                        </span>
                      )}
                      <span className="text-[#52525B]">{t.account.submitted} {fmtDate(b.created_at)}</span>
                    </div>
                  </div>
                  <span data-testid={`account-status-${b.id}`} className={`mono-label px-3 py-1 border ${statusStyles[b.status] || statusStyles.new}`}>
                    {statusLabel[b.status] || b.status}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountPage;
