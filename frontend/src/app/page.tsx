import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Story from "@/components/Story";
import Benefits from "@/components/Benefits";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#243b2a]">
      <Header />
      <Hero/>
      <Story/>
      <Benefits/>
    </main>
  );
}
