import { createContext, useContext, useState } from "react";

const LANG_KEY = "lm_site_lang";

const STR = {
  en: {
    nav: { services: "Services", workshop: "Workshop", gallery: "Gallery", visit: "Visit Us", book: "Book a Service" },
    hero: {
      kicker: "Motorcycle Repair & Servicing — Est. 2024",
      line1: "Your bike",
      line2a: "deserves",
      line2b: "better",
      sub: "A small, independent workshop keeping local riders on the road. Honest repairs, proper servicing, MOT prep and tyres — done right, priced straight.",
      cta1: "Book a service",
      cta2: "See what we do",
      stats: [
        { value: "2+", label: "Years on the tools" },
        { value: "500+", label: "Bikes back on the road" },
      ],
      scroll: "Scroll",
    },
    marquee: ["Repairs", "Servicing", "MOT & Inspection", "Tyres", "Diagnostics"],
    services: {
      kicker: "What we do",
      h1: "Four things.",
      h2: "Done right.",
      intro: "No upselling, no jargon, no mystery charges. If it doesn't need doing, we'll tell you. If it does, we'll show you why.",
      items: [
        { n: "01", title: "Repairs & Diagnostics", desc: "From electrical gremlins to engine rebuilds. We find the real fault, explain it in plain English, and fix it properly the first time." },
        { n: "02", title: "Servicing & Maintenance", desc: "Interim and full services, valve clearances, chain and brake care — scheduled around your riding season." },
        { n: "03", title: "MOT & Inspection", desc: "Pre-MOT checks, MOT arrangement, and honest pre-purchase inspections before you hand over cash for a used bike." },
        { n: "04", title: "Tyres & Fitting", desc: "Road, sport and classic rubber supplied and fitted with proper balancing. Ride in, ride out the same day." },
      ],
    },
    manifesto: {
      kicker: "The workshop creed",
      h1: "How we",
      h2: "work",
      chapters: [
        { n: "01", quote: "We fix the bikes other garages gave up on.", body: "Local Moto started in a single-bay unit with a toolbox and a stubborn belief: a small shop can out-care any main dealer. Two years in, most of our work already comes from riders telling other riders." },
        { n: "02", quote: "Every bolt matters. Especially the ones you can't see.", body: "We torque to spec, grease the threads, and photograph anything we find wrong before we touch it. You get the old parts back in a box — because trust is built on proof, not promises." },
        { n: "03", quote: "Ridden by us. Owned by you.", body: "Every bike that leaves the workshop gets a proper road test and a shake-down check. If we wouldn't ride it home, it doesn't leave. Simple as that." },
      ],
    },
    gallery: {
      kicker: "From the floor",
      h1: "Grease, steel",
      h2: "& patience.",
      intro: "Deep shadows, bare metal, mechanical detail. A few frames from recent jobs — rebuilds, services and the bikes that keep coming back.",
      captions: ["Engine out — full strip-down", "Gauges rebuilt — '72 Bonneville", "Front end — fork rebuild", "In for the big service", "The old ways still work", "Road-tested — ready to go"],
    },
    testimonials: {
      kicker: "Word on the street",
      h1: "Riders",
      h2: "talk.",
      quotes: [
        { text: "Two garages told me the engine was scrap. Local Moto had it running sweeter than the day I bought it — for less than either quote.", name: "Dan R.", bike: "Triumph Street Twin" },
        { text: "They photographed every worn part, talked me through each one, and gave me the old bits back in a box. Never had that from a dealer.", name: "Priya S.", bike: "Yamaha MT-07" },
        { text: "My dad's old CB550 came back better than new. They treated it like it was theirs. Can't recommend them enough.", name: "Marcus T.", bike: "Honda CB550 (engine rebuild)" },
      ],
    },
    contact: {
      kicker: "Get booked in",
      h1: "Roll in.",
      h2: "Roll out.",
      intro: "Tell us what's wrong — or what you're dreaming of — and we'll call you back with a time and a straight quote.",
      workshopLabel: "The workshop",
      phoneLabel: "Call the bench",
      hoursLabel: "Hours",
      hours: ["Mon–Fri: 8:30 — 17:30", "Sat: 9:00 — 13:00", "Sun: Closed"],
      tabBooking: "Book a service",
      tabEnquiry: "General enquiry",
      name: "Your name *",
      phone: "Phone *",
      email: "Email",
      emailReq: "Email *",
      bike: "Bike make & model *",
      serviceNeeded: "Service needed *",
      dateLabel: "Preferred date / time",
      notes: "Anything else?",
      message: "Message *",
      namePh: "Alex Rider",
      phonePh: "07700 900 123",
      emailPh: "you@email.com",
      bikePh: "e.g. Triumph Bonneville T120",
      datePh: "e.g. Any weekday morning next week",
      notesPh: "Rattling at 4k rpm, brakes feel soft…",
      messagePh: "Ask us anything — quotes, parts, project ideas…",
      submitBooking: "Request booking",
      submitEnquiry: "Send message",
      sending: "Sending…",
      toastBookingOk: "Booking request received. We'll ring you back within one working day.",
      toastBookingErr: "Couldn't send that — please call us instead.",
      toastEnquiryOk: "Message sent. We'll get back to you shortly.",
      toastEnquiryErr: "Couldn't send that — please try again.",
      services: [
        { value: "Repairs & Diagnostics", label: "Repairs & Diagnostics" },
        { value: "Servicing & Maintenance", label: "Servicing & Maintenance" },
        { value: "MOT & Inspection", label: "MOT & Inspection" },
        { value: "Tyres & Fitting", label: "Tyres & Fitting" },
      ],
    },
    footer: {
      findUs: "Find us",
      hours: "Hours",
      jumpTo: "Jump to",
      links: [
        { label: "Services", href: "#services" },
        { label: "Workshop", href: "#workshop" },
        { label: "Gallery", href: "#gallery" },
        { label: "Book a service", href: "#contact" },
      ],
      rights: "© 2026 Local Moto. All rights reserved.",
      tagline: "Ride safe. Torque to spec.",
    },
  },
  fr: {
    nav: { services: "Prestations", workshop: "Atelier", gallery: "Galerie", visit: "Nous trouver", book: "Réserver" },
    hero: {
      kicker: "Réparation & entretien moto — Depuis 2024",
      line1: "Votre moto",
      line2a: "mérite",
      line2b: "mieux",
      sub: "Un petit atelier indépendant qui garde les motards locaux sur la route. Réparations honnêtes, entretien soigné, préparation au contrôle technique et pneus — bien faits, au juste prix.",
      cta1: "Réserver un service",
      cta2: "Découvrir nos services",
      stats: [
        { value: "2+", label: "Années d'expérience" },
        { value: "500+", label: "Motos remises en route" },
      ],
      scroll: "Défiler",
    },
    marquee: ["Réparations", "Entretien", "Contrôle technique", "Pneus", "Diagnostic"],
    services: {
      kicker: "Ce que nous faisons",
      h1: "Quatre prestations.",
      h2: "Bien faites.",
      intro: "Pas de vente forcée, pas de jargon, pas de frais cachés. Si ce n'est pas nécessaire, on vous le dit. Si ça l'est, on vous montre pourquoi.",
      items: [
        { n: "01", title: "Réparations & Diagnostic", desc: "Des caprices électriques aux refontes moteur. On trouve la vraie panne, on vous l'explique simplement, et on répare correctement du premier coup." },
        { n: "02", title: "Entretien & Révisions", desc: "Révisions intermédiaires et complètes, jeu aux soupapes, chaîne et freins — planifiés selon votre saison de route." },
        { n: "03", title: "Contrôle technique", desc: "Préparation au contrôle technique, organisation du rendez-vous, et inspections avant-achat honnêtes avant de payer une moto d'occasion." },
        { n: "04", title: "Pneus & Montage", desc: "Pneus route, sport et classiques fournis et montés avec un équilibrage soigné. Vous arrivez, vous repartez le jour même." },
      ],
    },
    manifesto: {
      kicker: "Le credo de l'atelier",
      h1: "Notre",
      h2: "méthode",
      chapters: [
        { n: "01", quote: "On répare les motos que d'autres garages ont abandonnées.", body: "Local Moto a démarré dans un petit local avec une caisse à outils et une conviction tenace : un petit atelier peut être plus attentionné qu'un concessionnaire. Deux ans plus tard, l'essentiel de notre travail vient déjà du bouche à oreille entre motards." },
        { n: "02", quote: "Chaque boulon compte. Surtout ceux qu'on ne voit pas.", body: "On serre au couple, on graisse les filetages, et on photographie tout problème avant d'y toucher. Vous repartez avec les anciennes pièces dans une boîte — parce que la confiance se construit sur des preuves, pas des promesses." },
        { n: "03", quote: "Essayée par nous. Conduite par vous.", body: "Chaque moto qui quitte l'atelier passe un vrai essai routier et une vérification complète. Si nous ne la ramènerions pas nous-mêmes, elle ne part pas. C'est aussi simple que ça." },
      ],
    },
    gallery: {
      kicker: "Depuis l'atelier",
      h1: "Graisse, acier",
      h2: "& patience.",
      intro: "Ombres profondes, métal nu, détails mécaniques. Quelques images de chantiers récents — refontes, révisions et les motos qui reviennent nous voir.",
      captions: ["Moteur sorti — démontage complet", "Compteurs refaits — Bonneville '72", "Train avant — fourche refaite", "En grande révision", "Les vieilles méthodes fonctionnent toujours", "Essai routier fait — prête à partir"],
    },
    testimonials: {
      kicker: "Le bouche à oreille",
      h1: "Les motards",
      h2: "parlent.",
      quotes: [
        { text: "Deux garages m'ont dit que le moteur était bon pour la casse. Local Moto l'a fait tourner plus rond qu'au jour de l'achat — pour moins cher que leurs deux devis.", name: "Dan R.", bike: "Triumph Street Twin" },
        { text: "Ils ont photographié chaque pièce usée, me les ont expliquées une par une, et m'ont rendu les anciennes dans une boîte. Jamais vu ça chez un concessionnaire.", name: "Priya S.", bike: "Yamaha MT-07" },
        { text: "La vieille CB550 de mon père est revenue mieux que neuve. Ils l'ont traitée comme si c'était la leur. Je ne peux que les recommander.", name: "Marcus T.", bike: "Honda CB550 (refonte moteur)" },
      ],
    },
    contact: {
      kicker: "Prenez rendez-vous",
      h1: "Entrez.",
      h2: "Repartez.",
      intro: "Dites-nous ce qui ne va pas — ou ce dont vous rêvez — et on vous rappelle avec un créneau et un devis franc.",
      workshopLabel: "L'atelier",
      phoneLabel: "Appelez l'atelier",
      hoursLabel: "Horaires",
      hours: ["Lun–Ven : 8h30 — 17h30", "Sam : 9h00 — 13h00", "Dim : Fermé"],
      tabBooking: "Réserver un service",
      tabEnquiry: "Question générale",
      name: "Votre nom *",
      phone: "Téléphone *",
      email: "E-mail",
      emailReq: "E-mail *",
      bike: "Marque & modèle de la moto *",
      serviceNeeded: "Service souhaité *",
      dateLabel: "Date / heure préférée",
      notes: "Autre chose ?",
      message: "Message *",
      namePh: "Alex Motard",
      phonePh: "06 12 34 56 78",
      emailPh: "vous@email.com",
      bikePh: "ex. Triumph Bonneville T120",
      datePh: "ex. Un matin en semaine, la semaine prochaine",
      notesPh: "Cliquetis à 4000 tr/min, freins un peu mous…",
      messagePh: "Posez-nous vos questions — devis, pièces, idées de projet…",
      submitBooking: "Envoyer la demande",
      submitEnquiry: "Envoyer le message",
      sending: "Envoi…",
      toastBookingOk: "Demande de réservation reçue. On vous rappelle sous un jour ouvré.",
      toastBookingErr: "Impossible d'envoyer — appelez-nous plutôt.",
      toastEnquiryOk: "Message envoyé. On vous répond très vite.",
      toastEnquiryErr: "Impossible d'envoyer — réessayez.",
      services: [
        { value: "Repairs & Diagnostics", label: "Réparations & Diagnostic" },
        { value: "Servicing & Maintenance", label: "Entretien & Révisions" },
        { value: "MOT & Inspection", label: "Contrôle technique" },
        { value: "Tyres & Fitting", label: "Pneus & Montage" },
      ],
    },
    footer: {
      findUs: "Nous trouver",
      hours: "Horaires",
      jumpTo: "Accès rapide",
      links: [
        { label: "Prestations", href: "#services" },
        { label: "Atelier", href: "#workshop" },
        { label: "Galerie", href: "#gallery" },
        { label: "Réserver un service", href: "#contact" },
      ],
      rights: "© 2026 Local Moto. Tous droits réservés.",
      tagline: "Roulez prudemment. Serrez au couple.",
    },
  },
};

const LangCtx = createContext(null);

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || "en");
  const toggleLang = () => {
    const next = lang === "en" ? "fr" : "en";
    setLang(next);
    localStorage.setItem(LANG_KEY, next);
  };
  return <LangCtx.Provider value={{ lang, toggleLang, t: STR[lang] }}>{children}</LangCtx.Provider>;
};

export const useLang = () => useContext(LangCtx);
