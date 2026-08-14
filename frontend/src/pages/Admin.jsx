import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2, LogOut, Phone, Mail, Trash2, Bike, CalendarClock, Bell } from "lucide-react";
import {
  adminLogin, adminMe, adminGetBookings, adminGetEnquiries,
  adminUpdateBooking, adminUpdateEnquiry, adminDeleteBooking, adminDeleteEnquiry,
} from "@/lib/api";

const TOKEN_KEY = "lm_admin_token";

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

const StatusChip = ({ status, testid }) => (
  <span data-testid={testid} className={`mono-label px-3 py-1 border ${statusStyles[status] || statusStyles.new}`}>
    {status}
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
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [checking, setChecking] = useState(!!localStorage.getItem(TOKEN_KEY));
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState("bookings");
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setAuthed(false);
  }, []);

  const loadData = useCallback(async (t) => {
    setLoading(true);
    try {
      const [b, e] = await Promise.all([adminGetBookings(t), adminGetEnquiries(t)]);
      setBookings(b.data);
      setEnquiries(e.data);
    } catch (err) {
      if (err.response?.status === 401) logout();
      else toast.error("Couldn't load the latest requests.");
    } finally {
      setLoading(false);
    }
  }, [logout]);

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
      setError(typeof detail === "string" ? detail : "Login failed. Check your details.");
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (kind, id, status) => {
    try {
      if (kind === "booking") {
        const { data } = await adminUpdateBooking(token, id, status);
        setBookings((prev) => prev.map((b) => (b.id === id ? data : b)));
      } else {
        const { data } = await adminUpdateEnquiry(token, id, status);
        setEnquiries((prev) => prev.map((b) => (b.id === id ? data : b)));
      }
      toast.success(`Marked as ${status}.`);
    } catch {
      toast.error("Couldn't update that — try again.");
    }
  };

  const remove = async (kind, id) => {
    if (!window.confirm("Delete this request for good?")) return;
    try {
      if (kind === "booking") {
        await adminDeleteBooking(token, id);
        setBookings((prev) => prev.filter((b) => b.id !== id));
      } else {
        await adminDeleteEnquiry(token, id);
        setEnquiries((prev) => prev.filter((b) => b.id !== id));
      }
      toast.success("Deleted.");
    } catch {
      toast.error("Couldn't delete that — try again.");
    }
  };

  const jumpTo = (n) => {
    setTab(n.kind === "booking" ? "bookings" : "enquiries");
    setShowNotifs(false);
    setTimeout(() => document.getElementById(`req-${n.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 150);
  };

  if (checking) {
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
          className="w-full max-w-md bg-[#121212] border border-white/10 p-10"
        >
          <p className="font-display text-3xl text-[#F5F5F5] mb-1">LOCAL<span className="text-[#D35400]">MOTO</span></p>
          <p className="mono-label text-[#52525B] mb-10">Workshop admin</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-6" data-testid="admin-login-form">
            <div>
              <label htmlFor="admin-email" className="mono-label text-[#52525B] block mb-3">Email</label>
              <input id="admin-email" data-testid="admin-email-input" type="email" required className="input-industrial" placeholder="admin@localmoto.co.uk"
                value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="admin-password" className="mono-label text-[#52525B] block mb-3">Password</label>
              <input id="admin-password" data-testid="admin-password-input" type="password" required className="input-industrial" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {error && <p className="text-red-400 text-sm" data-testid="admin-login-error">{error}</p>}
            <button type="submit" data-testid="admin-login-submit" disabled={sending} className="btn-accent w-full disabled:opacity-60">
              {sending ? <Loader2 size={16} className="animate-spin" /> : null}
              {sending ? "Signing in…" : "Sign in"}
            </button>
          </form>
          <a href="/" data-testid="admin-back-home" className="mono-label text-[#52525B] hover:text-[#E67E22] transition-colors duration-300 block mt-8">
            ← Back to the site
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
          <p className="font-display text-2xl text-[#F5F5F5]">LOCAL<span className="text-[#D35400]">MOTO</span>
            <span className="mono-label text-[#52525B] ml-4 hidden sm:inline">Workshop admin</span>
          </p>
          <div className="flex items-center gap-4">
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
                    <p className="mono-label text-[#52525B] px-5 py-4 border-b border-white/10">New requests</p>
                    {newItems.length === 0 ? (
                      <p className="text-[#A1A1AA] text-sm px-5 py-6" data-testid="admin-notif-empty">All caught up — nothing new.</p>
                    ) : (
                      newItems.map((n) => (
                        <button
                          key={n.id}
                          data-testid={`admin-notif-item-${n.id}`}
                          onClick={() => jumpTo(n)}
                          className="w-full text-left px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
                        >
                          <span className="mono-label text-[#E67E22]">{n.kind}</span>
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
              <LogOut size={14} /> Log out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex gap-px bg-white/10 border border-white/10 w-fit" role="tablist">
            <button data-testid="admin-tab-bookings" role="tab" aria-selected={tab === "bookings"} onClick={() => setTab("bookings")}
              className={`mono-label px-6 py-3 transition-colors duration-300 ${tab === "bookings" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              Bookings ({bookings.length})
            </button>
            <button data-testid="admin-tab-enquiries" role="tab" aria-selected={tab === "enquiries"} onClick={() => setTab("enquiries")}
              className={`mono-label px-6 py-3 transition-colors duration-300 ${tab === "enquiries" ? "bg-[#D35400] text-[#F5F5F5]" : "bg-[#0A0A0A] text-[#A1A1AA] hover:text-[#F5F5F5]"}`}>
              Enquiries ({enquiries.length})
            </button>
          </div>
          <button data-testid="admin-refresh-button" onClick={() => loadData(token)}
            className="mono-label text-[#A1A1AA] hover:text-[#E67E22] border border-white/20 hover:border-[#D35400] px-4 py-2.5 transition-colors duration-300">
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>

        {items.length === 0 ? (
          <div className="border border-white/10 bg-[#121212] p-16 text-center" data-testid="admin-empty-state">
            <p className="font-display text-3xl text-[#52525B] uppercase">Nothing here yet</p>
            <p className="text-[#A1A1AA] text-sm mt-3">New {tab} from the website will show up here.</p>
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
                  <StatusChip status={item.status} testid={`admin-item-status-${item.id}`} />
                </div>

                {tab === "bookings" && (
                  <div className="flex flex-wrap gap-x-6 gap-y-1 mb-3 text-sm">
                    <span className="flex items-center gap-1.5 text-[#F5F5F5]">
                      <Bike size={14} className="text-[#D35400]" /> {item.bike_model}
                    </span>
                    <span className="mono-label text-[#E67E22] self-center">{item.service_type}</span>
                    {item.preferred_date && <span className="text-[#A1A1AA]">Prefers: {item.preferred_date}</span>}
                  </div>
                )}
                <p className="text-[#A1A1AA] text-sm leading-relaxed mb-6">{tab === "bookings" ? (item.notes || "—") : item.message}</p>

                <div className="flex flex-wrap gap-2">
                  {item.status !== "contacted" && item.status !== "done" && (
                    <ActionButton testid={`admin-mark-contacted-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "contacted")}>
                      Mark contacted
                    </ActionButton>
                  )}
                  {item.status !== "done" && (
                    <ActionButton testid={`admin-mark-done-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "done")}>
                      Mark done
                    </ActionButton>
                  )}
                  {item.status !== "new" && (
                    <ActionButton testid={`admin-mark-new-${item.id}`} onClick={() => setStatus(tab === "bookings" ? "booking" : "enquiry", item.id, "new")}>
                      Reopen
                    </ActionButton>
                  )}
                  <ActionButton danger testid={`admin-delete-${item.id}`} onClick={() => remove(tab === "bookings" ? "booking" : "enquiry", item.id)}>
                    <span className="flex items-center gap-1.5"><Trash2 size={12} /> Delete</span>
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
