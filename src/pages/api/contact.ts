import type { NextApiRequest, NextApiResponse } from "next";

type ContactFormData = {
  name: string;
  email: string;
  company?: string;
  phone: string;
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const formData: ContactFormData = req.body;

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      return res.status(400).json({ error: "Champs requis manquants" });
    }

    // TODO: Configuration SMTP à ajouter dans les variables d'environnement:
    // SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, SMTP_TO
    
    // Structure prête pour l'envoi d'email via nodemailer ou équivalent:
    /*
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_TO,
      subject: `Nouvelle demande de devis - ${formData.name}`,
      html: `
        <h2>Nouvelle demande de contact</h2>
        <p><strong>Nom:</strong> ${formData.name}</p>
        <p><strong>Email:</strong> ${formData.email}</p>
        ${formData.company ? `<p><strong>Entreprise:</strong> ${formData.company}</p>` : ""}
        <p><strong>Téléphone:</strong> ${formData.phone}</p>
        <p><strong>Message:</strong></p>
        <p>${formData.message.replace(/\n/g, "<br>")}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    */

    // Pour l'instant, simule un succès (à remplacer par l'envoi SMTP réel)
    console.log("Demande de contact reçue:", formData);

    return res.status(200).json({ 
      success: true, 
      message: "Message reçu avec succès" 
    });

  } catch (error) {
    console.error("Erreur lors du traitement:", error);
    return res.status(500).json({ error: "Erreur serveur" });
  }
}