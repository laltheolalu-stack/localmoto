import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Services", href: "#services" },
  { label: "Workshop", href: "#workshop" },
  { label: "Gallery", href: "#gallery" },
  { label: "Visit Us", href: "#contact" },
];

export const scrollToId = (href) => {
  const el = document.querySelector(href);
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset: -72 });
  else el.scrollIntoView({ behavior: "smooth" });
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

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
          className="font-display text-2xl tracking-wide text-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
        >
          LOCAL<span className="text-[#D35400]">MOTO</span>
        </button>

        <nav className="hidden md:flex items-center gap-10" data-testid="header-nav">
          {links.map((l) => (
            <button
              key={l.href}
              data-testid={`nav-link-${l.label.toLowerCase().replace(" ", "-")}`}
              onClick={() => go(l.href)}
              className="mono-label text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="nav-book-cta"
            onClick={() => go("#contact")}
            className="bg-[#D35400] hover:bg-[#E67E22] transition-colors duration-300 text-[#F5F5F5] mono-label px-6 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E67E22]"
          >
            Book a Service
          </button>
        </nav>

        <button
          data-testid="mobile-menu-toggle"
          className="md:hidden text-[#F5F5F5] p-2"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-black/90 backdrop-blur-xl border-t border-white/10 px-6 py-6 flex flex-col gap-5" data-testid="mobile-menu">
          {links.map((l) => (
            <button
              key={l.href}
              data-testid={`mobile-nav-${l.label.toLowerCase().replace(" ", "-")}`}
              onClick={() => go(l.href)}
              className="mono-label text-left text-[#A1A1AA] hover:text-[#F5F5F5] transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
          <button
            data-testid="mobile-nav-book-cta"
            onClick={() => go("#contact")}
            className="bg-[#D35400] text-[#F5F5F5] mono-label px-6 py-3 text-left"
          >
            Book a Service
          </button>
        </div>
      )}
    </motion.header>
  );
};

export default Header;
