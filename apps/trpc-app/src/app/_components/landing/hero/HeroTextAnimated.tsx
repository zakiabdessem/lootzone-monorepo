"use client";

import { gsap } from "gsap";
import { useLayoutEffect, useRef } from "react";
import styles from "./HeroTextAnimated.module.css";

interface HeroTextAnimatedProps {
  label?: string; // Text to display, can contain newline (\n) for line break
}

export default function HeroTextAnimated({
  label = "MINTY\nLEGENDS",
  currentSlide,
}: HeroTextAnimatedProps & { currentSlide: { product: any } }) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!wrapperRef.current) return;

    const ctx = gsap.context(() => {
      const slices = gsap.utils.toArray<HTMLElement>(`.${styles.slice}`);
      const innerTexts = gsap.utils.toArray<HTMLElement>(`.${styles.text}`);

      slices.forEach((slice, i) => {
        gsap.fromTo(
          slice,
          {
            opacity: 0,
            filter: "blur(6px)",
            scale: 0.85,
          },
          {
            opacity: 1,
            filter: "blur(0px)",
            scale: 1,
            duration: 1,
            ease: "power2.out",
            delay: i * 0.15,
          }
        );
      });

      innerTexts.forEach((el, i) => {
        const fromX = -100 * i;
        gsap.fromTo(
          el,
          { xPercent: fromX },
          {
            xPercent: 0,
            duration: 1,
            ease: "power2.out",
            delay: i * 0.15,
          }
        );
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, [label]);

  const lines = label.split("\n");

  return (
    <div className={styles.wrapper + " select-none max-w-fit"} ref={wrapperRef}>
      {[0, 2].map((idx) => (
        <div key={idx} className={styles.slice}>
          <div className={styles.text + " text-[#212121]"}>
            {lines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* <ProductCard {...currentSlide.product} /> */}
    </div>
  );
}
