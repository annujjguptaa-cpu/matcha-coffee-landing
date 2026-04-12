"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";

const FRAME_COUNT = 232;

export default function MatchaScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    if (!hasMounted) return;

    const loadedImages: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.src = `/sequence/frame_${i}.jpg`;
      img.onload = () => {
        loadedCount++;
        setProgress(Math.floor((loadedCount / FRAME_COUNT) * 100));
        if (loadedCount === FRAME_COUNT) {
          setImages(loadedImages);
          setIsLoading(false);
        }
      };
      loadedImages[i] = img;
    }
  }, [hasMounted]);

  useEffect(() => {
    if (!hasMounted || images.length === 0 || !canvasRef.current) return;

    const render = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;
      const canvas = canvasRef.current!;

      const frameIndex = Math.floor(smoothProgress.get() * (FRAME_COUNT - 1));
      const img = images[frameIndex];

      const setDimensions = () => {
        const { innerWidth, innerHeight } = window;
        const dpr = window.devicePixelRatio || 1;
        // Scale physical pixels on High DPI screens
        if (
          canvas.width !== Math.floor(innerWidth * dpr) ||
          canvas.height !== Math.floor(innerHeight * dpr)
        ) {
          canvas.width = Math.floor(innerWidth * dpr);
          canvas.height = Math.floor(innerHeight * dpr);
          canvas.style.width = `${innerWidth}px`;
          canvas.style.height = `${innerHeight}px`;
          ctx.scale(dpr, dpr);
        }
        return { innerWidth, innerHeight };
      };

      const logicalScreen = setDimensions();

      if (img && img.complete) {
        ctx.clearRect(
          0,
          0,
          logicalScreen.innerWidth,
          logicalScreen.innerHeight,
        );

        const canvasRatio =
          logicalScreen.innerWidth / logicalScreen.innerHeight;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawHeight = logicalScreen.innerHeight;
          drawWidth = img.width * (logicalScreen.innerHeight / img.height);
          offsetX = (logicalScreen.innerWidth - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = logicalScreen.innerWidth;
          drawHeight = img.height * (logicalScreen.innerWidth / img.width);
          offsetX = 0;
          offsetY = (logicalScreen.innerHeight - drawHeight) / 2;
        }

        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }
    };

    const unsubscribe = smoothProgress.on("change", render);
    render();
    return () => unsubscribe();
  }, [hasMounted, images, smoothProgress]);

  const createBeat = (start: number, end: number) => {
    const duration = end - start;
    const fadeInEnd = start + duration * 0.1;
    const fadeOutStart = end - duration * 0.1;

    return {
      opacity: useTransform(
        smoothProgress,
        [start, fadeInEnd, fadeOutStart, end],
        [0, 1, 1, 0],
      ),
      y: useTransform(
        smoothProgress,
        [start, fadeInEnd, fadeOutStart, end],
        [20, 0, 0, -20],
      ),
    };
  };

  const beatA = createBeat(0.0, 0.2);
  const beatB = createBeat(0.25, 0.45);
  const beatC = createBeat(0.5, 0.7);
  const beatD = createBeat(0.75, 0.95);

  return (
    <>
      {/* Loading Overlay */}
      {hasMounted && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white/60 transition-opacity duration-1000"
          style={{
            opacity: isLoading ? 1 : 0,
            pointerEvents: isLoading ? "auto" : "none",
          }}
        >
          <div className="w-48 h-[2px] bg-white/10 mb-4 rounded overflow-hidden">
            <motion.div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-white/50 font-mono text-xs tracking-widest uppercase">
            Brewing... {progress}%
          </p>
        </div>
      )}

      <div ref={containerRef} className="relative h-[400vh] bg-[#050505]">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full block" />

          <div className="absolute inset-0 pointer-events-none">
            {/* Beat A */}
            <motion.div
              style={{ opacity: beatA.opacity, y: beatA.y }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <h2 className="text-7xl md:text-9xl font-black text-white/90 tracking-tighter mb-4">
                THE PERFECT POUR.
              </h2>
              <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide">
                Experience the harmony of earth and energy.
              </p>
            </motion.div>

            {/* Beat B */}
            <motion.div
              style={{ opacity: beatB.opacity, y: beatB.y }}
              className="absolute inset-0 flex flex-col justify-center text-left p-8 md:p-24 lg:w-2/3"
            >
              <h2 className="text-5xl md:text-8xl font-black text-white/90 tracking-tighter mb-4">
                EMERALD SUSPENSION.
              </h2>
              <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide max-w-xl">
                Ceremonial grade matcha shattered into gravity-defying droplets.
              </p>
            </motion.div>

            {/* Beat C */}
            <motion.div
              style={{ opacity: beatC.opacity, y: beatC.y }}
              className="absolute inset-0 flex flex-col justify-center items-end text-right p-8 md:p-24 w-full"
            >
              <div className="lg:w-2/3 flex flex-col items-end">
                <h2 className="text-5xl md:text-8xl font-black text-white/90 tracking-tighter mb-4">
                  THE CATALYST.
                </h2>
                <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide max-w-xl text-right">
                  Rich espresso and creamy milk colliding in a chaotic,
                  beautiful matrix.
                </p>
              </div>
            </motion.div>

            {/* Beat D */}
            <motion.div
              style={{ opacity: beatD.opacity, y: beatD.y }}
              className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
              <h2 className="text-7xl md:text-9xl font-black text-white/90 tracking-tighter mb-6">
                TASTE THE ART.
              </h2>
              <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide mb-6">
                Crafted for the senses. Scroll to rebuild.
              </p>
              <button className="px-10 py-3 border border-white/20 bg-white/5 hover:bg-white/15 text-white tracking-widest text-sm rounded-full transition-colors duration-300">
                ORDER THE EXPERIENCE
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
