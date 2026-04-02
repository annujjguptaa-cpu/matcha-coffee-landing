"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useSpring, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 232;

export default function MatchaScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Preload Images
  useEffect(() => {
    let loadedCount = 0;
    const imgArray: HTMLImageElement[] = [];

    for (let i = 0; i < FRAME_COUNT; i++) {
        const img = new Image();
        img.src = `/sequence/frame_${i}.jpg`;
        img.onload = () => {
            loadedCount++;
            setLoaded(Math.floor((loadedCount / FRAME_COUNT) * 100));
        };
        imgArray.push(img);
    }
    setImages(imgArray);
  }, []);

  // Draw loop
  useEffect(() => {
    if (loaded < 100 || images.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
        const progress = smoothProgress.get();
        // Allow the last frame to render exactly
        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.max(0, Math.floor(progress * FRAME_COUNT))
        );

        const img = images[frameIndex];
        
        const setDimensions = () => {
            const { innerWidth, innerHeight } = window;
            const dpr = window.devicePixelRatio || 1;
            
            // Adjust canvas for retina displays for crisp edges
            if (canvas.width !== innerWidth * dpr || canvas.height !== innerHeight * dpr) {
                canvas.width = innerWidth * dpr;
                canvas.height = innerHeight * dpr;
                canvas.style.width = `${innerWidth}px`;
                canvas.style.height = `${innerHeight}px`;
                ctx.scale(dpr, dpr);
            }
        };

        setDimensions();

        if (img && img.complete) {
            // we have applied dpr scale, so logical size is innerWidth x innerHeight
            const logicalWidth = window.innerWidth;
            const logicalHeight = window.innerHeight;
            
            ctx.clearRect(0, 0, logicalWidth, logicalHeight);
            
            // draw object-fit contain
            const canvasRatio = logicalWidth / logicalHeight;
            const imgRatio = img.width / img.height;
            
            let drawWidth, drawHeight, offsetX, offsetY;
            
            if (canvasRatio > imgRatio) {
                // canvas is wider than image
                drawHeight = logicalHeight;
                drawWidth = img.width * (logicalHeight / img.height);
                offsetX = (logicalWidth - drawWidth) / 2;
                offsetY = 0;
            } else {
                drawWidth = logicalWidth;
                drawHeight = img.height * (logicalWidth / img.width);
                offsetX = 0;
                offsetY = (logicalHeight - drawHeight) / 2;
            }
            
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        }
        
        animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
        cancelAnimationFrame(animationFrameId);
    };
  }, [loaded, images, smoothProgress]);

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white/60 transition-opacity duration-1000"
        style={{ opacity: loaded === 100 ? 0 : 1, pointerEvents: loaded === 100 ? 'none' : 'auto' }}
      >
          <div className="w-64 h-[1px] bg-white/20 mb-4 rounded overflow-hidden">
              <div className="h-full bg-white transition-all duration-300" style={{ width: `${Math.min(loaded, 100)}%` }} />
          </div>
          <p className="text-sm tracking-widest font-light">LOADING {Math.min(loaded, 100)}%</p>
      </div>

      <div ref={containerRef} className="h-[400vh] relative w-full bg-[#050505] z-0">
          <div className="sticky top-0 h-screen w-full overflow-hidden">
              <canvas
                  ref={canvasRef}
                  className="w-full h-full block"
              />
              <div className="absolute inset-0 pointer-events-none">
                  <TextOverlays progress={scrollYProgress} />
              </div>
              
              <motion.div 
                  style={{ opacity: useTransform(scrollYProgress, [0, 0.05], [1, 0]) }}
                  className="absolute bottom-[10vh] left-0 w-full text-center text-white/40 tracking-widest text-sm pointer-events-none z-10"
              >
                  <div className="flex flex-col items-center gap-2">
                      <span className="animate-pulse">SCROLL TO EXPLORE</span>
                      <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent" />
                  </div>
              </motion.div>
          </div>
      </div>
    </>
  );
}

function TextOverlays({ progress }: { progress: any }) {
  // Beat A — 0–20% Scroll
  const beatAOpacity = useTransform(progress, [0.0, 0.05, 0.15, 0.20], [0, 1, 1, 0]);
  const beatAY = useTransform(progress, [0.0, 0.05, 0.15, 0.20], [20, 0, 0, -20]);

  // Beat B — 25–45% Scroll
  const beatBOpacity = useTransform(progress, [0.25, 0.30, 0.40, 0.45], [0, 1, 1, 0]);
  const beatBY = useTransform(progress, [0.25, 0.30, 0.40, 0.45], [20, 0, 0, -20]);

  // Beat C — 50–70% Scroll
  const beatCOpacity = useTransform(progress, [0.50, 0.55, 0.65, 0.70], [0, 1, 1, 0]);
  const beatCY = useTransform(progress, [0.50, 0.55, 0.65, 0.70], [20, 0, 0, -20]);

  // Beat D — 75–95% Scroll
  const beatDOpacity = useTransform(progress, [0.75, 0.80, 0.90, 0.95], [0, 1, 1, 0]);
  const beatDY = useTransform(progress, [0.75, 0.80, 0.90, 0.95], [20, 0, 0, -20]);

  return (
    <div className="absolute inset-0 w-full h-full">
        {/* Beat A */}
        <motion.div 
            style={{ opacity: beatAOpacity, y: beatAY }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
            <h2 className="text-7xl md:text-9xl font-black text-white/90 tracking-tighter mb-4">THE PERFECT POUR.</h2>
            <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide">Experience the harmony of earth and energy.</p>
        </motion.div>

        {/* Beat B */}
        <motion.div 
            style={{ opacity: beatBOpacity, y: beatBY }}
            className="absolute inset-0 flex flex-col justify-center text-left p-8 md:p-24 lg:w-2/3"
        >
            <h2 className="text-6xl md:text-8xl font-black text-white/90 tracking-tighter mb-4">EMERALD SUSPENSION.</h2>
            <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide max-w-xl">Ceremonial grade matcha shattered into gravity-defying droplets.</p>
        </motion.div>

        {/* Beat C */}
        <motion.div 
            style={{ opacity: beatCOpacity, y: beatCY }}
            className="absolute inset-0 flex flex-col justify-center items-end text-right p-8 md:p-24 w-full"
        >
            <div className="lg:w-2/3 flex flex-col items-end">
                <h2 className="text-6xl md:text-8xl font-black text-white/90 tracking-tighter mb-4">THE CATALYST.</h2>
                <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide max-w-xl text-right">Rich espresso and creamy milk colliding in a chaotic, beautiful matrix.</p>
            </div>
        </motion.div>

        {/* Beat D */}
        <motion.div 
            style={{ opacity: beatDOpacity, y: beatDY }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
        >
            <h2 className="text-7xl md:text-9xl font-black text-white/90 tracking-tighter mb-6">TASTE THE ART.</h2>
            <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide mb-12">Crafted for the senses. Scroll to rebuild.</p>
            <button className="px-12 py-4 border border-white/20 hover:bg-white text-white hover:text-black transition-colors duration-500 tracking-widest text-sm rounded-full pointer-events-auto">
                DISCOVER THE BLEND
            </button>
        </motion.div>
    </div>
  );
}
