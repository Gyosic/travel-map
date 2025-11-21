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
}

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  autoplayInterval = 5000,
  className,
  enableBtn = true,
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
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  width={500}
                  height={500}
                  draggable={false}
                  className="h-full w-full rounded-3xl object-cover object-center"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <div className="flex flex-col py-2">
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
            {/* <h3 className="text-2xl font-bold text-black dark:text-white">
              {testimonials[active].name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-neutral-500">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-8 text-lg text-gray-500 dark:text-neutral-300">
              {testimonials[active].quote.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p> */}
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