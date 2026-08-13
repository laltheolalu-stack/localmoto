import { motion } from "framer-motion";
import { scrollToId } from "@/components/Header";

const Footer = () => {
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-24 lg:pt-32 overflow-hidden" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-20">
          <div>
            <p className="mono-label text-[#52525B] mb-4">Find us</p>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Unit 4, Foundry Lane<br />Millbrook, MB1 2QT<br />
              <a href="tel:+441234567890" data-testid="footer-phone" className="hover:text-[#E67E22] transition-colors duration-300">01234 567 890</a><br />
              <a href="mailto:hello@localmoto.co.uk" data-testid="footer-email" className="hover:text-[#E67E22] transition-colors duration-300">hello@localmoto.co.uk</a>
            </p>
          </div>
          <div>
            <p className="mono-label text-[#52525B] mb-4">Hours</p>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              Mon–Fri: 8:30 — 17:30<br />Sat: 9:00 — 13:00<br />Sun: Closed
            </p>
          </div>
          <div>
            <p className="mono-label text-[#52525B] mb-4">Jump to</p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Services", href: "#services" },
                { label: "Workshop", href: "#workshop" },
                { label: "Gallery", href: "#gallery" },
                { label: "Book a service", href: "#contact" },
              ].map((l) => (
                <button
                  key={l.href}
                  data-testid={`footer-link-${l.label.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => scrollToId(l.href)}
                  className="text-left text-[#A1A1AA] text-sm hover:text-[#E67E22] transition-colors duration-300 w-fit focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D35400]"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ y: 120, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        className="px-6 lg:px-12"
      >
        <p className="font-display uppercase text-[16vw] leading-[0.8] text-stroke text-center select-none" data-testid="footer-wordmark">
          Local Moto
        </p>
      </motion.div>

      <div className="border-t border-white/10 mt-[-1vw] relative bg-[#050505]">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row justify-between gap-3">
          <p className="mono-label text-[#52525B]">© 2026 Local Moto. All rights reserved.</p>
          <p className="mono-label text-[#52525B]">Ride safe. Torque to spec.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
