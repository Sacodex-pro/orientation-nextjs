"use client"

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type Filiere = {
  nom: string
  categorie: string
  series: string
  niveau: string
  debouches: string
  salaire: string
}

const filieres: Filiere[] = [
  { nom: "Informatique", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Developpeur, administrateur systemes, data analyst", salaire: "150 000 - 700 000 FCFA/mois" },
  { nom: "Mathematiques - Physique - Informatique (MPI)", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur, enseignant, chercheur, data scientist", salaire: "150 000 - 600 000 FCFA/mois" },
  { nom: "Mathematiques appliquees et informatique", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Data scientist, actuaire, ingenieur logiciel", salaire: "200 000 - 700 000 FCFA/mois" },
  { nom: "Physique - Chimie (PC)", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Enseignant, chercheur, technicien de laboratoire", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Physique - Chimie - Sciences de la matiere (PCSM)", categorie: "Sciences et Ingenierie", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Chercheur, enseignant, ingenieur materiaux", salaire: "150 000 - 550 000 FCFA/mois" },
  { nom: "Chimie", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur chimiste, technicien de laboratoire", salaire: "150 000 - 500 000 FCFA/mois" },
  { nom: "Geologie", categorie: "Sciences et Ingenierie", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Geologue minier, petrolier, environnemental", salaire: "200 000 - 800 000 FCFA/mois" },
  { nom: "Energies renouvelables", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur solaire, technicien energie verte", salaire: "180 000 - 600 000 FCFA/mois" },
  { nom: "Telecommunications et Electronique", categorie: "Sciences et Ingenierie", series: "S1, S2, T", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur telecoms, technicien reseaux", salaire: "180 000 - 700 000 FCFA/mois" },
  { nom: "Developpement web et applications", categorie: "Sciences et Ingenierie", series: "S1, S2", niveau: "Licence professionnelle", debouches: "Developpeur web, developpeur mobile", salaire: "180 000 - 700 000 FCFA/mois" },

  { nom: "Medecine", categorie: "Sante", series: "S1, S2", niveau: "Doctorat (7 ans)", debouches: "Medecin generaliste ou specialiste", salaire: "300 000 - 1 500 000 FCFA/mois" },
  { nom: "Pharmacie", categorie: "Sante", series: "S1, S2", niveau: "Doctorat (6 ans)", debouches: "Pharmacien d'officine, industriel, hospitalier", salaire: "300 000 - 1 200 000 FCFA/mois" },
  { nom: "Odontostomatologie", categorie: "Sante", series: "S1, S2", niveau: "Doctorat (6 ans)", debouches: "Chirurgien-dentiste", salaire: "300 000 - 1 200 000 FCFA/mois" },
  { nom: "Sciences infirmieres et paramedicales", categorie: "Sante", series: "S1, S2, S3", niveau: "Licence (LMD)", debouches: "Infirmier, sage-femme, technicien de sante", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Biologie", categorie: "Sante", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Biologiste, chercheur, technicien de laboratoire, enseignant", salaire: "150 000 - 500 000 FCFA/mois" },
  { nom: "Biologie - Chimie - Geosciences (BCG)", categorie: "Sante", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Chercheur, enseignant, technicien de laboratoire", salaire: "150 000 - 500 000 FCFA/mois" },

  { nom: "Agronomie", categorie: "Agriculture et Environnement", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur agronome, conseiller agricole", salaire: "150 000 - 600 000 FCFA/mois" },
  { nom: "Agrobusiness et Entrepreneuriat", categorie: "Agriculture et Environnement", series: "S1, S2, S3, G", niveau: "Licence - Master (LMD)", debouches: "Entrepreneur agricole, chef d'exploitation", salaire: "150 000 - 700 000 FCFA/mois" },
  { nom: "Aquaculture", categorie: "Agriculture et Environnement", series: "S1, S2, S3", niveau: "Licence - Master (LMD)", debouches: "Technicien aquacole, gestionnaire de ferme piscicole", salaire: "130 000 - 450 000 FCFA/mois" },
  { nom: "Sciences de la Terre et Environnement", categorie: "Agriculture et Environnement", series: "S1, S2, S3", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Ingenieur environnement, consultant ecologique", salaire: "180 000 - 600 000 FCFA/mois" },
  { nom: "Technologies agro-alimentaires", categorie: "Agriculture et Environnement", series: "S1, S2, S3", niveau: "Licence - Master (LMD)", debouches: "Ingenieur agroalimentaire, controleur qualite", salaire: "150 000 - 550 000 FCFA/mois" },

  { nom: "Droit", categorie: "Economie Gestion et Droit", series: "L1, L2, S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Avocat, magistrat, juriste d'entreprise", salaire: "150 000 - 800 000 FCFA/mois" },
  { nom: "Sciences politiques", categorie: "Economie Gestion et Droit", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Diplomate, analyste politique", salaire: "200 000 - 700 000 FCFA/mois" },
  { nom: "Economie", categorie: "Economie Gestion et Droit", series: "S1, S2, G, L1", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Economiste, analyste financier, conseiller", salaire: "180 000 - 700 000 FCFA/mois" },
  { nom: "FASEG - Sciences Economiques et de Gestion", categorie: "Economie Gestion et Droit", series: "S1, S2, G, L1", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Economiste, gestionnaire, comptable, analyste financier, cadre bancaire", salaire: "180 000 - 700 000 FCFA/mois" },
  { nom: "Gestion des entreprises", categorie: "Economie Gestion et Droit", series: "G, S1, S2", niveau: "Licence - Master (LMD)", debouches: "Manager, chef de projet, entrepreneur", salaire: "150 000 - 700 000 FCFA/mois" },
  { nom: "Banque et Finance", categorie: "Economie Gestion et Droit", series: "G, S1, S2", niveau: "Licence - Master (LMD)", debouches: "Analyste financier, conseiller bancaire", salaire: "200 000 - 900 000 FCFA/mois" },
  { nom: "Administration Economique et Sociale (AES)", categorie: "Economie Gestion et Droit", series: "L1, L2, G", niveau: "Licence - Master (LMD)", debouches: "Cadre administratif, fonctionnaire", salaire: "150 000 - 500 000 FCFA/mois" },
  { nom: "Management du tourisme et de l'hotellerie", categorie: "Economie Gestion et Droit", series: "G, L1, L2", niveau: "Licence - Master (LMD)", debouches: "Manager d'hotel, agent de voyage", salaire: "130 000 - 500 000 FCFA/mois" },
  { nom: "Statistiques et actuariat", categorie: "Economie Gestion et Droit", series: "S1, S2", niveau: "Licence - Master (LMD)", debouches: "Statisticien, actuaire, data analyst", salaire: "250 000 - 900 000 FCFA/mois" },

  { nom: "Lettres modernes", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Professeur de francais, journaliste, ecrivain", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Anglais", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Professeur d'anglais, traducteur, interprete", salaire: "120 000 - 450 000 FCFA/mois" },
  { nom: "Espagnol", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master (LMD)", debouches: "Professeur, traducteur", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Arabe", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master (LMD)", debouches: "Professeur, traducteur, diplomate", salaire: "120 000 - 450 000 FCFA/mois" },
  { nom: "Langues Etrangeres Appliquees (LEA)", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master (LMD)", debouches: "Traducteur, charge de commerce international", salaire: "150 000 - 500 000 FCFA/mois" },
  { nom: "Histoire", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Professeur d'histoire, chercheur, archiviste", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Geographie", categorie: "Lettres et Sciences humaines", series: "L1, L2, S1, S2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Professeur, urbaniste, cartographe", salaire: "130 000 - 450 000 FCFA/mois" },
  { nom: "Philosophie", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Professeur de philosophie, chercheur", salaire: "120 000 - 400 000 FCFA/mois" },
  { nom: "Sociologie", categorie: "Lettres et Sciences humaines", series: "L1, L2", niveau: "Licence - Master - Doctorat (LMD)", debouches: "Sociologue, charge d'etudes, travailleur social", salaire: "150 000 - 500 000 FCFA/mois" },

  { nom: "Communication", categorie: "Arts et Communication", series: "L1, L2, G", niveau: "Licence - Master (LMD)", debouches: "Charge de communication, journaliste, RP", salaire: "150 000 - 600 000 FCFA/mois" },
  { nom: "Communication digitale", categorie: "Arts et Communication", series: "L1, L2, G, S1, S2", niveau: "Licence - Master (LMD)", debouches: "Community manager, specialiste marketing digital", salaire: "150 000 - 600 000 FCFA/mois" },
  { nom: "Infographie", categorie: "Arts et Communication", series: "ARTS, L1, L2", niveau: "Licence professionnelle", debouches: "Infographiste, designer graphique", salaire: "130 000 - 500 000 FCFA/mois" },
  { nom: "Arts graphiques et numeriques", categorie: "Arts et Communication", series: "ARTS", niveau: "Licence - Master (LMD)", debouches: "Designer, illustrateur, animateur 3D", salaire: "130 000 - 550 000 FCFA/mois" },

  { nom: "Professeurs de college (PCEM)", categorie: "Enseignement", series: "S1, S2, L1, L2", niveau: "Licence - Master (LMD) plus Concours", debouches: "Professeur de college toutes matieres", salaire: "150 000 - 400 000 FCFA/mois" },
  { nom: "Sciences des activites physiques et sportives (STAPS)", categorie: "Enseignement", series: "S1, S2, L1, L2", niveau: "Licence - Master (LMD)", debouches: "Professeur d'EPS, entraineur sportif", salaire: "130 000 - 400 000 FCFA/mois" },
]

const categories = [
  "Sciences et Ingenierie",
  "Sante",
  "Agriculture et Environnement",
  "Economie Gestion et Droit",
  "Lettres et Sciences humaines",
  "Arts et Communication",
  "Enseignement",
]

const TOUTES = "Toutes"

/* Fait apparaître son contenu en glissant vers le haut quand il entre à l'écran */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={
        "transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none " +
        (visible
          ? "translate-y-0 opacity-100"
          : "translate-y-6 opacity-0 motion-reduce:opacity-100") +
        " " +
        className
      }
    >
      {children}
    </div>
  )
}

export default function Filieres() {
  const router = useRouter()
  const [filtre, setFiltre] = useState(TOUTES)

  const filtrees = useMemo(
    () =>
      filtre === TOUTES
        ? filieres
        : filieres.filter((f) => f.categorie === filtre),
    [filtre]
  )

  /* Retour à la page précédente, ou à l'accueil si aucun historique */
  const retourner = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const styleBouton = (actif: boolean) =>
    "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all duration-300 active:scale-95 " +
    (actif
      ? "bg-blue-900 text-white shadow-md"
      : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-900")

  return (
    <main className="min-h-screen overflow-x-hidden bg-white">
      <style>{`
        @keyframes headerDown {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }
        .header-anim { animation: headerDown 0.6s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .header-anim { animation: none; }
        }
      `}</style>

      <header className="header-anim sticky top-0 z-50 flex items-center justify-between gap-4 border-b bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
        <a
          href="/"
          className="text-lg font-extrabold text-blue-900 transition-transform duration-300 hover:scale-105 sm:text-xl"
        >
          Orientation Senegal
        </a>

        <button
          type="button"
          onClick={retourner}
          className="group flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-900 transition-all duration-300 hover:border-blue-200 hover:bg-blue-100 active:scale-95"
        >
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:-translate-x-1"
          >
            ←
          </span>
          Retour
        </button>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
        <Reveal>
          <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
            Toutes les filieres
          </h1>
        </Reveal>
        <Reveal delay={100}>
          <p className="mb-6 text-gray-500 sm:mb-8">
            Systeme LMD (Licence - Master - Doctorat)
          </p>
        </Reveal>

        {/* Filtres : défilement horizontal sur téléphone, retour à la ligne sur grand écran */}
        <Reveal delay={200} className="mb-8 sm:mb-10">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              aria-pressed={filtre === TOUTES}
              onClick={() => setFiltre(TOUTES)}
              className={styleBouton(filtre === TOUTES)}
            >
              {TOUTES}
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={filtre === cat}
                onClick={() => setFiltre(cat)}
                className={styleBouton(filtre === cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        {/* La clé relance l'animation des cartes à chaque changement de filtre */}
        <div
          key={filtre}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3"
        >
          {filtrees.map((f, index) => (
            <Reveal
              key={f.nom}
              delay={(index % 3) * 100}
              className="h-full"
            >
              <div className="group flex h-full flex-col rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:p-6">
                <span className="mb-3 self-start rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-900 transition-transform duration-300 group-hover:scale-105">
                  {f.categorie}
                </span>

                <h3 className="mb-2 text-base font-bold sm:text-lg">{f.nom}</h3>

                <div className="mb-2 text-sm text-gray-500">
                  Series: {f.series}
                </div>
                <div className="mb-2 text-sm text-gray-600">
                  Niveau: {f.niveau}
                </div>
                <div className="mb-3 flex-1 text-sm text-gray-600">
                  Debouches: {f.debouches}
                </div>

                <div className="border-t pt-3 text-sm font-semibold text-blue-900">
                  {f.salaire}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}