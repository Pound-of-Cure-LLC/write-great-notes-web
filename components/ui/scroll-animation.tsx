"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef, ReactNode } from "react";

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  fullWidth?: boolean;
  viewport?: UseInViewOptions;
}

export function FadeIn({
  children,
  className = "",
  delay = 0,
  duration = 0.5,
  direction = "up",
  fullWidth = false,
  viewport = { once: true, margin: "-50px" },
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewport);

  const getDirectionOffset = () => {
    switch (direction) {
      case "up":
        return { y: 40, x: 0 };
      case "down":
        return { y: -40, x: 0 };
      case "left":
        return { x: 40, y: 0 };
      case "right":
        return { x: -40, y: 0 };
      case "none":
        return { x: 0, y: 0 };
      default:
        return { y: 40, x: 0 };
    }
  };

  const initial = { opacity: 0, ...getDirectionOffset() };
  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : { opacity: 0, ...getDirectionOffset() };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
      style={{ width: fullWidth ? "100%" : "auto" }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  viewport?: UseInViewOptions;
}

export function StaggerContainer({
  children,
  className = "",
  delay = 0,
  staggerDelay = 0.1,
  viewport = { once: true, margin: "-50px" },
}: StaggerContainerProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, viewport);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "show" : "hidden"}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}






