import { motion } from "framer-motion";
import { Star } from "lucide-react";
import TrackedHeading from "@/components/TrackedHeading";

const quotes = [
  {
    text: "Two garages told me the engine was scrap. Local Moto had it running sweeter than the day I bought it — for less than either quote.",
    name: "Dan R.",
    bike: "Triumph Street Twin",
  },
  {
    text: "They photographed every worn part, talked me through each one, and gave me the old bits back in a box. Never had that from a dealer.",
    name: "Priya S.",
    bike: "Yamaha MT-07",
  },
  {
    text: "My dad's old CB550 came back better than new. They treated it like it was theirs. Can't recommend them enough.",
    name: "Marcus T.",
    bike: "Honda CB550 (restoration)",
  },
];

const Testimonials = () => {
  return (
    <section className="py-28 lg:py-40 border-b border-white/10 bg-[#0D0D0D]" data-testid="testimonials-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <p className="mono-label text-[#D35400] mb-5" data-testid="testimonials-kicker">Word on the street</p>
        <TrackedHeading className="text-5xl md:text-7xl mb-16 lg:mb-24" data-testid="testimonials-heading">
          Riders <span className="text-stroke">talk.</span>
        </TrackedHeading>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/10 border border-white/10">
          {quotes.map((q, i) => (
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
                <div className="flex gap-1 mb-8" aria-label="5 star rating">
                  {[...Array(5)].map((_, s) => (
                    <Star key={s} size={14} className="fill-[#F39C12] text-[#F39C12]" />
                  ))}
                </div>
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
