"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Pause, Play, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Photo {
  src: string;
  alt?: string;
  caption?: string;
  date?: string;
  location?: string;
}

interface PhotoStoryProps {
  photos: Photo[];
  autoPlayInterval?: number; // 밀리초 단위
  onClose?: () => void;
  className?: string;
  enableKenBurns?: boolean; // Ken Burns 효과 (확대/축소)
}

const transitions = [
  // Fade
  {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Slide from right
  {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  // Zoom in
  {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 1.2, opacity: 0 },
  },
  // Rotate
  {
    initial: { rotate: -10, scale: 0.8, opacity: 0 },
    animate: { rotate: 0, scale: 1, opacity: 1 },
    exit: { rotate: 10, scale: 0.8, opacity: 0 },
  },
];

export function PhotoStory({
  photos,
  autoPlayInterval = 3000,
  onClose,
  className,
  enableKenBurns = true,
}: PhotoStoryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // 랜덤 전환 효과 선택
  const getRandomTransition = () => {
    return transitions[Math.floor(Math.random() * transitions.length)];
  };

  const [currentTransition, setCurrentTransition] = useState(getRandomTransition());

  // 자동 재생
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [isPlaying, currentIndex, autoPlayInterval]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrev();
      if (e.key === "ArrowRight") goToNext();
      if (e.key === " ") {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      }
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isPlaying, onClose]);

  const goToNext = () => {
    setCurrentTransition(getRandomTransition());
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  const goToPrev = () => {
    setCurrentTransition(getRandomTransition());
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // 터치 이벤트 (스와이프)
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // 왼쪽으로 스와이프
      goToNext();
    }

    if (touchStart - touchEnd < -75) {
      // 오른쪽으로 스와이프
      goToPrev();
    }
  };

  const currentPhoto = photos[currentIndex];

  return (
    <div
      className={cn("fixed inset-0 z-999 flex items-center justify-center bg-black", className)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      {onClose && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      {/* Photo container */}
      <div className="relative h-full w-full overflow-hidden">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentIndex}
            {...currentTransition}
            transition={{
              duration: 0.7,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <motion.img
              src={currentPhoto.src}
              alt={currentPhoto.alt || `Photo ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              animate={
                enableKenBurns
                  ? {
                      scale: [1, 1.1],
                      x: [0, Math.random() * 20 - 10],
                      y: [0, Math.random() * 20 - 10],
                    }
                  : {}
              }
              transition={
                enableKenBurns
                  ? {
                      duration: autoPlayInterval / 1000,
                      ease: "linear",
                    }
                  : {}
              }
            />

            {/* Caption overlay */}
            {(currentPhoto.caption || currentPhoto.location || currentPhoto.date) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute right-0 bottom-0 left-0 from-black/80 to-transparent p-8"
              >
                {currentPhoto.caption && (
                  <p className="mb-2 font-medium text-white text-xl">{currentPhoto.caption}</p>
                )}
                {(currentPhoto.location || currentPhoto.date) && (
                  <div className="flex gap-4 text-sm text-white/80">
                    {currentPhoto.location && <span>{currentPhoto.location}</span>}
                    {currentPhoto.date && <span>{currentPhoto.date}</span>}
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="-translate-y-1/2 pointer-events-none absolute inset-x-0 top-1/2 flex justify-between px-4">
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={goToPrev}
        >
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="pointer-events-auto h-12 w-12 rounded-full text-white hover:bg-white/20"
          onClick={goToNext}
        >
          <ChevronRight className="h-8 w-8" />
        </Button>
      </div>

      {/* Controls */}
      <div className="-translate-x-1/2 absolute bottom-8 left-1/2 flex items-center gap-4">
        {/* Play/Pause button */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-white hover:bg-white/20"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        {/* Progress indicator */}
        <div className="flex gap-1">
          {photos.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 cursor-pointer rounded-full transition-all",
                index === currentIndex ? "w-8 bg-white" : "w-6 bg-white/40 hover:bg-white/60",
              )}
              onClick={() => {
                setCurrentIndex(index);
                setCurrentTransition(getRandomTransition());
              }}
            />
          ))}
        </div>

        {/* Counter */}
        <span className="text-sm text-white">
          {currentIndex + 1} / {photos.length}
        </span>
      </div>
    </div>
  );
}
