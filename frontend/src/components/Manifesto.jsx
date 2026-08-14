import { motion } from "framer-motion";
import TrackedHeading from "@/components/TrackedHeading";
import { useLang } from "@/lib/site-lang";

const Manifesto = () => {
  const { t } = useLang();
  return (
    <section id="workshop" className="py-28 lg:py-40 border-b border-white/10 bg-[#0D0D0D]" data-testid="manifesto-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <p className="mono-label text-[#D35400] mb-5" data-testid="manifesto-kicker">{t.manifesto.kicker}</p>
        <TrackedHeading className="text-5xl md:text-7xl mb-20 lg:mb-28" data-testid="manifesto-heading">
          {t.manifesto.h1} <span className="text-stroke">{t.manifesto.h2}</span>
        </TrackedHeading>

        <div className="flex flex-col">
          {t.manifesto.chapters.map((c, i) => (
            <motion.div
              key={c.n}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 py-14 lg:py-20 border-t border-white/10 ${
                i % 2 === 1 ? "lg:text-right" : ""
              }`}
              data-testid={`manifesto-chapter-${c.n}`}
            >
              <div className={`lg:col-span-4 ${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <span className="font-display text-[7rem] lg:text-[11rem] leading-[0.8] text-stroke block">{c.n}</span>
              </div>
              <div className={`lg:col-span-8 flex flex-col justify-center ${i % 2 === 1 ? "lg:order-1 lg:items-end" : ""}`}>
                <p className="font-editorial italic text-2xl md:text-4xl text-[#F5F5F5] leading-snug mb-6 max-w-2xl">
                  “{c.quote}”
                </p>
                <p className="text-[#A1A1AA] text-base leading-relaxed max-w-xl">{c.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Manifesto;
