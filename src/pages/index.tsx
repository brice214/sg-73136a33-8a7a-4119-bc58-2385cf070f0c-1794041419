import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Services } from "@/components/Services";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO
        title="LIONS SERVICES GABON - Inspection Oil & Gas"
        description="Leader de l'inspection, métrologie et expertise technique pour l'industrie pétrolière et gazière au Gabon. Certifications internationales ISO 9001."
      />
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Hero />
          <Services />
          <About />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}