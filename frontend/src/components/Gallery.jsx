import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TrackedHeading from "@/components/TrackedHeading";

const images = [
  {
    src: "https://images.unsplash.com/photo-1636761358757-0a616eb9e17e?q=85&w=1200&auto=format&fit=crop",
    alt: "Mechanic deep in a custom build inside a dark workshop",
    caption: "Engine out — full strip-down",
    tall: true,
  },
  {
    src: "https://images.unsplash.com/photo-1585152001872-1c1bc66b8ca3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGRldGFpbCUyMGNsb3NlJTIwdXB8ZW58MHx8fGJsYWNrfDE3ODY2NTMyMzV8MA&ixlib=rb-4.1.0&q=85",
    alt: "Restored vintage speedometer, mechanical detail close-up",
    caption: "Gauges rebuilt — '72 Bonneville",
  },
  {
    src: "https://images.unsplash.com/photo-1569783899665-fda807461780?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwyfHx2aW50YWdlJTIwbW90b3JjeWNsZSUyMGRldGFpbCUyMGNsb3NlJTIwdXB8ZW58MHx8fGJsYWNrfDE3ODY2NTMyMzV8MA&ixlib=rb-4.1.0&q=85",
    alt: "Motorcycle fork mechanical detail in deep shadow",
    caption: "Front end — full rebuild",
  },
  {
    src: "https://images.unsplash.com/photo-1661215477041-ec4501e00042?q=85&w=1200&auto=format&fit=crop",
    alt: "Blacked-out custom motorcycle standing in a shadowy garage",
    caption: "In for the big service",
  },
  {
    src: "https://images.unsplash.com/photo-1514443031610-8c063c7a9822?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1ODR8MHwxfHNlYXJjaHwzfHxkYXJrJTIwYXRtb3NwaGVyaWMlMjBnYXJhZ2UlMjB0b29sc3xlbnwwfHx8fDE3ODY2NTMyMzV8MA&ixlib=rb-4.1.0&q=85",
    alt: "Grayscale hand tools, mechanical workshop detail",
    caption: "The old ways still work",
  },
  {
    src: "https://images.unsplash.com/photo-1568708167243-438efa1d7697?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NjZ8MHwxfHNlYXJjaHwzfHxjdXN0b20lMjByZXRybyUyMG1vdG9yY3ljbGUlMjBzdHVkaW98ZW58MHx8fHwxNzg2NjUzMjM1fDA&ixlib=rb-4.1.0&q=85",
    alt: "Finished custom cruiser on concrete under a spotlight",
    caption: "Road-tested — ready to go",
    tall: true,
  },
];

const Gallery = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yDrift = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section id="gallery" ref={ref} className="py-28 lg:py-40 border-b border-white/10" data-testid="gallery-section">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-24">
          <div>
            <p className="mono-label text-[#D35400] mb-5" data-testid="gallery-kicker">From the floor</p>
            <TrackedHeading className="text-5xl md:text-7xl" data-testid="gallery-heading">
              Grease, steel<br />
              <span className="text-stroke">& patience.</span>
            </TrackedHeading>
          </div>
          <p className="text-[#A1A1AA] text-base max-w-md leading-relaxed">
            Deep shadows, bare metal, mechanical detail. A few frames from
            recent jobs — rebuilds, services and the bikes that keep coming back.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {images.map((img, i) => (
            <motion.figure
              key={img.src}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.8, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              style={img.tall ? { y: yDrift } : undefined}
              className={`group relative overflow-hidden border border-white/10 spotlight-frame ${
                img.tall ? "row-span-2 aspect-[3/4] lg:aspect-auto" : "aspect-square"
              }`}
              data-testid={`gallery-item-${i + 1}`}
            >
              <img
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="w-full h-full object-cover brightness-[0.72] contrast-[1.15] saturate-[0.85] transition-[filter,transform] duration-[600ms] ease-out group-hover:scale-105 group-hover:brightness-95"
              />
              <figcaption className="absolute inset-x-0 bottom-0 z-10 bg-black/60 backdrop-blur-sm px-4 py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <span className="mono-label text-[#F5F5F5]">{img.caption}</span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
