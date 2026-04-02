"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, useSpring, motion } from "framer-motion";

const FRAME_COUNT = 120;

export default function MatchaScrollAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            img.src = `/sequence/frame_${i}.webp`; // Ensure images are in /public/sequence/
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
    }, []);

    useEffect(() => {
        if (images.length === 0 || !canvasRef.current) return;

        const render = () => {
            const context = canvasRef.current?.getContext("2d");
            if (context) {
                const frameIndex = Math.floor(smoothProgress.get() * (FRAME_COUNT - 1));
                const img = images[frameIndex];

                if (img) {
                    const canvas = canvasRef.current!;
                    context.clearRect(0, 0, canvas.width, canvas.height);
                    const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const x = (canvas.width / 2) - (img.width / 2) * scale;
                    const y = (canvas.height / 2) - (img.height / 2) * scale;
                    context.drawImage(img, x, y, img.width * scale, img.height * scale);
                }
            }
        };

        const unsubscribe = smoothProgress.on("change", render);
        render();
        return () => unsubscribe();
    }, [images, smoothProgress]);

    const opacityA = useTransform(scrollYProgress, [0, 0.1, 0.2, 0.25], [0, 1, 1, 0]);
    const opacityB = useTransform(scrollYProgress, [0.3, 0.4, 0.5, 0.55], [0, 1, 1, 0]);

    if (isLoading) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505]">
                <div className="w-48 h-[2px] bg-white/10 mb-4">
                    <motion.div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-white/50 font-mono text-xs tracking-widest uppercase">Brewing... {progress}%</p>
            </div>
        );
    }

    return (
        <div ref={containerRef} className="relative h-[400vh] bg-[#050505]">
            <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
                <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full object-contain" />
                <motion.div style={{ opacity: opacityA }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                    <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-white">THE PERFECT POUR.</h1>
                </motion.div>
                <motion.div style={{ opacity: opacityB }} className="absolute left-10 md:left-20 top-1/2 -translate-y-1/2 max-w-xl">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">EMERALD SUSPENSION.</h2>
                </motion.div>
            </div>
        </div>
    );
}