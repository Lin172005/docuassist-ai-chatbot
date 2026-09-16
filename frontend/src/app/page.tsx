import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Story from "@/components/Story";
import Products from "@/components/Products";
import Benefits from "@/components/Benefits";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
      <Header dark />
      <Hero />
      <Story />
      <Products />
      <Benefits />
    </main>
  );
}
