import Header from "@/components/Header"
import Hero from "@/components/Hero"
import Products from "@/components/Products";
import Story from "@/components/Story";
import Benefits from "@/components/Benefits";
import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf0] text-[#243b2a]">
      <Header />
      <Hero/>
      <Products/>
      <Story/>
      <Benefits/>
      <ChatWidget/>
    </main>
  );
}