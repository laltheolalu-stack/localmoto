import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const TrackedHeading = ({ children, className = "", ...props }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 95%", "start 45%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [48, 0]);
  const letterSpacing = useTransform(scrollYProgress, [0, 1], ["-0.02em", "0.055em"]);

  return (
    <motion.h2
      ref={ref}
      style={{ opacity, y, letterSpacing }}
      className={`font-display uppercase leading-[0.9] text-[#F5F5F5] ${className}`}
      {...props}
    >
      {children}
    </motion.h2>
  );
};

export default TrackedHeading;
