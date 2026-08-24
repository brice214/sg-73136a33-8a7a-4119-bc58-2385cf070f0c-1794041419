import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Facebook } from "lucide-react";

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-lions-services.jpg"
                alt="LIONS SERVICES GABON"
                width={50}
                height={50}
                className="rounded-lg"
              />
              <div>
                <div className="font-display font-bold text-xl">LIONS SERVICES</div>
                <div className="text-xs text-white/80">Excellence & Expertise</div>
              </div>
            </div>
            <p className="text-white/80 leading-relaxed">
              Votre partenaire de confiance pour l'inspection, la métrologie et l'expertise technique dans le secteur Oil & Gas au Gabon.
            </p>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { label: "Accueil", href: "hero" },
                { label: "Services", href: "services" },
                { label: "À propos", href: "about" },
                { label: "Contact", href: "contact" },
              ].map((link) => (
                <li key={link.href}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/80 hover:text-accent transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-4">Services</h3>
            <ul className="space-y-2 text-white/80">
              <li>Inspection & Contrôle</li>
              <li>Métrologie</li>
              <li>Expertise Technique</li>
              <li>Maintenance Industrielle</li>
              <li>Gestion de Projets</li>
              <li>Certification & Conformité</li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <Mail className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <a
                  href="mailto:contact@lionsservices.ga"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  contact@lionsservices.ga
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <a
                  href="tel:+241XXXXXXXX"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  +241 XX XX XX XX
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                <span className="text-white/80">Libreville, Gabon</span>
              </li>
            </ul>

            <div className="flex items-center gap-3 mt-6">
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 rounded-lg bg-white/10 hover:bg-accent transition-colors flex items-center justify-center"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <p>© {currentYear} LIONS SERVICES GABON. Tous droits réservés.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-accent transition-colors">
                Mentions légales
              </a>
              <a href="#" className="hover:text-accent transition-colors">
                Politique de confidentialité
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}