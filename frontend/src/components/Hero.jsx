import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import { scrollToId } from "@/components/Header";

const HERO_IMG =
  "https://images.unsplash.com/photo-1473147437169-91ac8cebc017?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwxfHxjdXN0b20lMjByZXRybyUyMG1vdG9yY3ljbGUlMjBzdHVkaW98ZW58MHx8fHwxNzg2NjUzMjM1fDA&ixlib=rb-4.1.0&q=85";

const line = {
  hidden: { y: "110%" },
  show: (i) => ({
    y: 0,
    transition: { duration: 1, delay: 0.25 + i * 0.16, ease: [0.16, 1, 0.3, 1] },
  }),
};

const stats = [
  { value: "2+", label: "Years on the tools" },
  { value: "500+", label: "Bikes back on the road" },
  { value: "Free", label: "No-obligation quotes" },
];

const Hero = () => {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 900], [0, 260]);
  const bgScale = useTransform(scrollY, [0, 900], [1.05, 1.18]);
  const fade = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" data-testid="hero-section">
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={HERO_IMG}
          alt="Custom retro motorcycle in a dark studio"
          className="w-full h-full object-cover"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/55 to-[#0A0A0A]/30" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A]/70 via-transparent to-transparent" />

      <motion.div style={{ opacity: fade }} className="relative z-10 max-w-[1600px] mx-auto w-full px-6 lg:px-12 pb-16 lg:pb-24 pt-40">
        <div className="overflow-hidden mb-6">
          <motion.p
            variants={line}
            custom={0}
            initial="hidden"
            animate="show"
            className="mono-label text-[#D35400]"
            data-testid="hero-kicker"
          >
            Motorcycle Repair & Servicing — Est. 2024
          </motion.p>
        </div>

        <h1 className="font-display uppercase leading-[0.88] tracking-tight text-[#F5F5F5]">
          <span className="block overflow-hidden">
            <motion.span variants={line} custom={1} initial="hidden" animate="show" className="block text-[15vw] lg:text-[11vw]">
              Your bike
            </motion.span>
          </span>
          <span className="block overflow-hidden">
            <motion.span variants={line} custom={2} initial="hidden" animate="show" className="block text-[15vw] lg:text-[11vw]">
              deserves <span className="text-stroke-accent">better</span>
            </motion.span>
          </span>
        </h1>

        <div className="overflow-hidden mt-8 max-w-xl">
          <motion.p
            variants={line}
            custom={3}
            initial="hidden"
            animate="show"
            className="text-[#A1A1AA] text-base md:text-lg leading-relaxed"
            data-testid="hero-subcopy"
          >
            A small, independent workshop keeping local riders on the road. Honest
            repairs, proper servicing, MOT prep and tyres — done right, priced
            straight.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.05, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center gap-4 mt-10"
        >
          <button data-testid="hero-book-cta" onClick={() => scrollToId("#contact")} className="btn-accent group">
            Book a service
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </button>
          <button data-testid="hero-services-cta" onClick={() => scrollToId("#services")} className="btn-ghost">
            See what we do
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="grid grid-cols-3 gap-6 mt-16 pt-8 border-t border-white/10 max-w-2xl"
          data-testid="hero-stats"
        >
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-3xl md:text-5xl text-[#F5F5F5]">{s.value}</p>
              <p className="mono-label text-[#52525B] mt-2">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.button
        data-testid="hero-scroll-hint"
        onClick={() => scrollToId("#services")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-8 right-6 lg:right-12 z-10 hidden md:flex flex-col items-center gap-3 text-[#52525B] hover:text-[#D35400] transition-colors duration-300"
        aria-label="Scroll down"
      >
        <span className="mono-label rotate-90 origin-center translate-y-[-8px]">Scroll</span>
        <ArrowDown size={16} className="animate-bounce mt-8" />
      </motion.button>
    </section>
  );
};

export default Hero;
