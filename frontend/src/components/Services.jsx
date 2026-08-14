import { motion } from "framer-motion";
import { Wrench, Gauge, ClipboardCheck, Disc3 } from "lucide-react";
import TrackedHeading from "@/components/TrackedHeading";
import { useLang } from "@/lib/site-lang";

const TOOLS_IMG =
  "https://images.unsplash.com/photo-1514443031610-8c063c7a9822?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxkYXJrJTIwYXRtb3NwaGVyaWMlMjBnYXJhZ2UlMjB0b29sc3xlbnwwfHx8fDE3ODY2NTMyMzV8MA&ixlib=rb-4.1.0&q=85";

const icons = [Wrench, Gauge, ClipboardCheck, Disc3];

const cardMotion = (i) => ({
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
});

const Services = () => {
  const { t } = useLang();
  return (
    <section id="services" className="py-28 lg:py-40 border-b border-white/10" data-testid="services-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-24">
          <div>
            <p className="mono-label text-[#D35400] mb-5" data-testid="services-kicker">{t.services.kicker}</p>
            <TrackedHeading className="text-5xl md:text-7xl" data-testid="services-heading">
              {t.services.h1}<br />
              <span className="text-stroke">{t.services.h2}</span>
            </TrackedHeading>
          </div>
          <p className="text-[#A1A1AA] text-base max-w-md leading-relaxed">
            {t.services.intro}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {t.services.items.map((s, i) => {
            const Icon = icons[i];
            return (
              <motion.article
                key={s.n}
                {...cardMotion(i)}
                data-testid={`service-card-${s.n}`}
                className="group relative bg-[#121212] p-8 lg:p-10 border border-transparent hover:border-[#D35400] transition-colors duration-500 overflow-hidden"
              >
                {i === 0 && (
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-25 transition-opacity duration-700">
                    <img src={TOOLS_IMG} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent" />
                  </div>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-14 lg:mb-20">
                    <span className="font-display text-6xl lg:text-7xl text-stroke leading-none">{s.n}</span>
                    <Icon size={26} className="text-[#52525B] group-hover:text-[#D35400] transition-colors duration-500 mt-2" />
                  </div>
                  <h3 className="font-display uppercase text-3xl lg:text-4xl text-[#F5F5F5] mb-4 leading-none">{s.title}</h3>
                  <p className="text-[#A1A1AA] text-sm leading-relaxed max-w-md">{s.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
