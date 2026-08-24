import { Search, Gauge, FileCheck, Wrench, BarChart3, ClipboardCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    icon: Search,
    title: "Inspection & Contrôle",
    description: "Inspection complète des équipements, installations et infrastructures pétrolières selon les normes internationales.",
    features: ["Inspection visuelle", "Contrôle non destructif", "Audit de conformité"],
  },
  {
    icon: Gauge,
    title: "Métrologie",
    description: "Services de métrologie de précision pour garantir l'exactitude des mesures critiques dans vos opérations.",
    features: ["Étalonnage", "Vérification", "Certification métrologique"],
  },
  {
    icon: FileCheck,
    title: "Expertise Technique",
    description: "Analyses approfondies et diagnostics techniques par nos experts certifiés du secteur Oil & Gas.",
    features: ["Analyse de défaillance", "Diagnostics", "Recommandations"],
  },
  {
    icon: Wrench,
    title: "Maintenance Industrielle",
    description: "Solutions de maintenance préventive et corrective pour optimiser la disponibilité de vos équipements.",
    features: ["Maintenance préventive", "Interventions", "Support technique"],
  },
  {
    icon: BarChart3,
    title: "Gestion de Projets",
    description: "Accompagnement complet dans la gestion et le suivi de vos projets industriels complexes.",
    features: ["Planification", "Suivi qualité", "Reporting"],
  },
  {
    icon: ClipboardCheck,
    title: "Certification & Conformité",
    description: "Vérification de conformité aux standards HSE et obtention de certifications requises.",
    features: ["Audits HSE", "Certifications", "Conformité réglementaire"],
  },
];

export function Services() {
  return (
    <section id="services" className="section-padding bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-block px-4 py-1.5 bg-accent/10 text-accent font-semibold text-sm rounded-full">
            Nos Services
          </div>
          <h2 className="font-display font-bold text-4xl md:text-5xl text-primary">
            Solutions complètes pour l'industrie Oil & Gas
          </h2>
          <p className="text-lg text-muted-foreground">
            Expertise technique et rigueur opérationnelle au service de vos projets les plus exigeants
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="border-2 hover:border-accent hover:shadow-lg transition-all duration-300 group"
            >
              <CardHeader>
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-accent/10 transition-colors">
                  <service.icon className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
                </div>
                <CardTitle className="font-display text-2xl">{service.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}