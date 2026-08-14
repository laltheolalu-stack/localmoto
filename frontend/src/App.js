import { useEffect } from "react";
import Lenis from "lenis";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { LangProvider } from "@/lib/site-lang";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import EditorialMarquee from "@/components/EditorialMarquee";
import Services from "@/components/Services";
import Manifesto from "@/components/Manifesto";
import Gallery from "@/components/Gallery";
import Testimonials from "@/components/Testimonials";
import ContactBooking from "@/components/ContactBooking";
import Footer from "@/components/Footer";
import AdminPage from "@/pages/Admin";

const Landing = () => (
  <>
    <Header />
    <main>
      <Hero />
      <EditorialMarquee />
      <Services />
      <Manifesto />
      <Gallery />
      <Testimonials />
      <ContactBooking />
    </main>
    <Footer />
  </>
);

function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    let frame;
    const raf = (time) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  return (
    <div className="bg-[#0A0A0A] text-[#F5F5F5] min-h-screen" data-testid="app-root">
      <div className="noise-overlay" aria-hidden="true" />
      <LangProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </BrowserRouter>
      </LangProvider>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default App;
