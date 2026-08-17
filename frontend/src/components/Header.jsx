import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { useLang } from "@/lib/site-lang";

export const scrollToId = (href) => {
  const el = document.querySelector(href);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: "smooth" });
};

const LangButton = ({ testid }) => {
  const { lang, toggleLang } = useLang();
  return (
    <button
      data-testid={testid}
      onClick={toggleLang}
      aria-label="Switch language"
      className="mono-label flex items-center gap-2 text-[#A1A1AA] hover:text-[#E67E22] border border-white/20 hover:border-[#D35400] px-3 py-2 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
    >
      <Globe size={14} />
      {lang === "en" ? "FR" : "EN"}
    </button>
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const links = [
    { label: t.nav.services, href: "#services", testid: "nav-link-services" },
    { label: t.nav.workshop, href: "#workshop", testid: "nav-link-workshop" },
    { label: t.nav.gallery, href: "#gallery", testid: "nav-link-gallery" },
    { label: t.nav.visit, href: "#contact", testid: "nav-link-visit-us" },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const go = (href) => {
    setOpen(false);
    scrollToId(href);
  };

  return (
    <motion.header
      data-testid="site-header"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
        scrolled ? "bg-black/60 backdrop-blur-xl border-b border-white/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6 lg:px-12 h-[72px]">
        <button
          data-testid="header-logo"
          onClick={() => window.__lenis?.scrollTo(0)}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
        >
          <img src="/logo.png" alt="Local Moto" className="h-10 w-auto" />
        </button>

        <nav className="hidden md:flex items-center gap-8" data-testid="header-nav">
          {links.map((l) => (
            <button
              key={l.href}
              data-testid={l.testid}
              onClick={() => go(l.href)}
              className="mono-label text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="nav-login"
            onClick={() => (window.location.href = "/account")}
            className="mono-label text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
          >
            {t.nav.login}
          </button>
          <LangButton testid="site-lang-toggle" />
          <button
            data-testid="nav-book-cta"
            onClick={() => go("#contact")}
            className="bg-[#D35400] hover:bg-[#E67E22] transition-colors duration-300 text-[#F5F5F5] mono-label px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22]"
          >
            {t.nav.book}
          </button>
        </nav>

        <div className="md:hidden flex items-center gap-3">
          <LangButton testid="site-lang-toggle-mobile" />
          <button
            data-testid="mobile-menu-toggle"
            className="text-[#F5F5F5] p-2"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-5" data-testid="mobile-menu">
          {links.map((l) => (
            <button
              key={l.href}
              data-testid={`mobile-${l.testid}`}
              onClick={() => go(l.href)}
              className="mono-label text-left text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="mobile-nav-login"
            onClick={() => (window.location.href = "/account")}
            className="mono-label text-left text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300"
          >
            {t.nav.login}
          </button>
          <button
            data-testid="mobile-nav-book-cta"
            onClick={() => go("#contact")}
            className="bg-[#D35400] text-[#F5F5F5] mono-label px-6 py-3 text-left"
          >
            {t.nav.book}
          </button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
