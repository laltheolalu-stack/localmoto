import { motion } from "framer-motion";
import { scrollToId } from "@/components/Header";
import { useLang } from "@/lib/site-lang";

const Footer = () => {
  const { t } = useLang();
  return (
    <footer className="bg-[#050505] border-t border-white/10 pt-24 lg:pt-32 overflow-hidden" data-testid="site-footer">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pb-20">
          <div>
            <p className="mono-label text-[#52525B] mb-4">{t.footer.findUs}</p>
            <p className="text-[#A1A1AA] text-sm leading-relaxed">
              4273 Laurentian Autoroute<br />
              <a href="tel:+15142666607" data-testid="footer-phone" className="hover:text-[#E67E22] transition-colors duration-300">514 266 6607</a><br />
              <a href="mailto:hello@localmoto.co.uk" data-testid="footer-email" className="hover:text-[#E67E22] transition-colors duration-300">hello@localmoto.co.uk</a>
            </p>
          </div>
          <div>
            <p className="mono-label text-[#52525B] mb-4">{t.footer.jumpTo}</p>
            <div className="flex flex-col gap-2">
              {t.footer.links.map((l) => (
                <button
                  key={l.href}
                  data-testid={`footer-link-${l.href.replace("#", "")}`}
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
          <p className="mono-label text-[#52525B]">{t.footer.rights}</p>
          <p className="mono-label text-[#52525B]">{t.footer.tagline}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
