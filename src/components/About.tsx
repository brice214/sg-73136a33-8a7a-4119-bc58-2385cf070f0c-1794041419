import { Target, Award, Users, TrendingUp } from "lucide-react";
import Image from "next/image";

export function About() {
  const values = [
    {
      icon: Target,
      title: "Précision",
      description: "Rigueur technique et exactitude dans chaque intervention",
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Standards internationaux et certifications de qualité",
    },
    {
      icon: Users,
      title: "Expertise",
      description: "Équipe hautement qualifiée avec 15+ ans d'expérience",
    },
    {
      icon: TrendingUp,
      title: "Innovation",
      description: "Technologies de pointe et méthodologies éprouvées",
    },
  ];

  return (
    <section id="about" className="section-padding bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-6">
            <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-full">
              À propos
            </div>
            <h2 className="font-display font-bold text-4xl md:text-5xl text-primary">
              Partenaire de confiance de l'industrie gabonaise
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">LIONS SERVICES GABON</strong> est une entreprise spécialisée dans l'inspection, la métrologie et l'expertise technique pour le secteur Oil & Gas au Gabon.
              </p>
              <p>
                Depuis notre création, nous accompagnons les acteurs majeurs de l'industrie pétrolière et gazière avec des solutions d'inspection conformes aux normes internationales les plus strictes.
              </p>
              <p>
                Notre équipe d'experts certifiés intervient sur l'ensemble du territoire gabonais pour garantir la sécurité, la conformité et la performance de vos installations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6">
              {values.map((value, index) => (
                <div key={index} className="space-y-2">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold text-lg">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border-4 border-accent/20">
              <Image
                src="/logo-lions-services.jpg"
                alt="LIONS SERVICES GABON"
                fill
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-accent/20 rounded-2xl -z-10" />
            <div className="absolute -top-6 -left-6 h-24 w-24 bg-primary/20 rounded-2xl -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
}