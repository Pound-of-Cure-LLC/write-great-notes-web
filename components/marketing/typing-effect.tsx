"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypingEffectProps {
  text: string;
  className?: string;
  cursorColor?: string;
  speed?: number;
  startDelay?: number;
}

export function TypingEffect({
  text,
  className,
  cursorColor = "bg-primary",
  speed = 30,
  startDelay = 1000,
}: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimeout = setTimeout(() => {
      setIsStarted(true);
    }, startDelay);

    return () => clearTimeout(startTimeout);
  }, [startDelay]);

  useEffect(() => {
    if (!isStarted) return;

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isStarted, text, speed]);

  return (
    <div className={cn("relative inline-block", className)}>
      <span>{displayedText}</span>
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
        className={cn("inline-block w-[2px] h-[1.2em] align-middle ml-0.5", cursorColor)}
      />
    </div>
  );
}


