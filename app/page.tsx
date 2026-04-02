import MatchaScrollAnimation from "@/components/MatchaScrollAnimation";

export default function Home() {
  return (
    <main className="bg-[#050505] selection:bg-green-500/30">
      <MatchaScrollAnimation />

      <section className="h-screen flex items-center justify-center bg-[#050505] relative z-10">
        <h2 className="text-white/20 text-sm tracking-[0.5em] uppercase">
          Crafted by Gemini x Next.js
        </h2>
      </section>
    </main>
  );
}