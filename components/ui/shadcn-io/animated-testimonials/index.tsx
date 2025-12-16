"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  quote?: string;
  name?: string;
  designation?: string;
  src: string;
};

export interface AnimatedTestimonialsProps {
  testimonials: Testimonial[];
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
  enableBtn? :boolean;
  onClick?: () => void;
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  autoplayInterval = 5000,
  className,
  enableBtn = true,
  onClick
}: AnimatedTestimonialsProps) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  const DRAG_THRESHOLD = 50;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, autoplayInterval);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => {
    return Math.floor(Math.random() * 21) - 10;
  };

  return (
    <div className={cn("mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl", className)}>
      <div className="relative flex flex-col w-full h-full">
        <div className="relative h-full w-full">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.src}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -DRAG_THRESHOLD) handleNext();
                  else if (info.offset.x > DRAG_THRESHOLD) handlePrev();
                }}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: randomRotateY(),
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.7,
                  scale: isActive(index) ? 1 : 0.95,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : randomRotateY(),
                  zIndex: isActive(index)
                    ? 40
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -80, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: randomRotateY(),
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 origin-bottom"
                onClick={onClick}
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name || ""}
                  width={10}
                  height={10}
                  draggable={false}
                  className="h-full w-full rounded-3xl object-contain object-center"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
          </motion.div>
          {enableBtn && <div className="flex gap-4 justify-center">
            <button
              onClick={handlePrev}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-primary dark:bg-primary-foreground cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover/button:rotate-12 dark:text-neutral-400" />
            </button>
            <button
              onClick={handleNext}
              className="group/button flex h-7 w-7 items-center justify-center rounded-full bg-primary dark:bg-primary-foreground cursor-pointer"
            >
              <ChevronRight className="h-5 w-5 text-primary-foreground transition-transform duration-300 group-hover/button:-rotate-12 dark:text-neutral-400" />
            </button>
          </div>}
        </div>
      </div>
    </div>
  );
};