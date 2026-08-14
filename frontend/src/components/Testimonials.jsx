import { motion } from "framer-motion";
import TrackedHeading from "@/components/TrackedHeading";
import { useLang } from "@/lib/site-lang";

const Testimonials = () => {
  const { t } = useLang();
  return (
    <section className="py-28 lg:py-40 border-b border-white/10 bg-[#0D0D0D]" data-testid="testimonials-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <p className="mono-label text-[#D35400] mb-5" data-testid="testimonials-kicker">{t.testimonials.kicker}</p>
        <TrackedHeading className="text-5xl md:text-7xl mb-16 lg:mb-24" data-testid="testimonials-heading">
          {t.testimonials.h1} <span className="text-stroke">{t.testimonials.h2}</span>
        </TrackedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {t.testimonials.quotes.map((q, i) => (
            <motion.blockquote
              key={q.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="bg-[#121212] p-8 lg:p-12 flex flex-col justify-between min-h-[320px]"
              data-testid={`testimonial-${i + 1}`}
            >
              <div>
                <p className="font-editorial italic text-xl md:text-2xl text-[#F5F5F5] leading-snug">
                  “{q.text}”
                </p>
              </div>
              <footer className="mt-10">
                <p className="mono-label text-[#F5F5F5]">{q.name}</p>
                <p className="mono-label text-[#52525B] mt-1">{q.bike}</p>
              </footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
