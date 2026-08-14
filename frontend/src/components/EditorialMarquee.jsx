import Marquee from "react-fast-marquee";
import { useLang } from "@/lib/site-lang";

const EditorialMarquee = () => {
  const { t } = useLang();
  return (
    <div className="border-y border-white/10 py-6 lg:py-8 bg-[#0A0A0A]" data-testid="editorial-marquee">
      <Marquee speed={35} gradient={false} pauseOnHover>
        {t.marquee.map((item) => (
          <span key={item} className="flex items-center">
            <span className="font-display uppercase text-4xl lg:text-6xl text-stroke mx-8 tracking-wide">
              {item}
            </span>
            <span className="text-[#D35400] text-2xl lg:text-3xl mx-2">✕</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
};

export default EditorialMarquee;
