"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type Universite = {
  nom: string
  ville: string
  type: "Publique" | "Privée"
  description: string
}

const universites: Universite[] = [
  { nom: "Université Cheikh Anta Diop (UCAD)", ville: "Dakar", type: "Publique", description: "La plus grande et la plus ancienne université du Sénégal." },
  { nom: "Université Gaston Berger (UGB)", ville: "Saint-Louis", type: "Publique", description: "Réputée pour ses filières scientifiques et de gestion." },
  { nom: "Université Alioune Diop de Bambey (UADB)", ville: "Bambey", type: "Publique", description: "Agriculture, sciences, gestion, santé." },
  { nom: "Université Amadou Mahtar Mbow (UAM)", ville: "Diamniadio", type: "Publique", description: "Innovation, numérique, entrepreneuriat." },
  { nom: "Université Iba Der Thiam de Thiès (UIDT)", ville: "Thiès", type: "Publique", description: "Sciences, ingénierie, formation des enseignants." },
  { nom: "Université Assane Seck de Ziguinchor (UASZ)", ville: "Ziguinchor", type: "Publique", description: "Sciences, lettres, agroforesterie, tourisme." },
  { nom: "Université du Sine Saloum (USSEIN)", ville: "Kaolack", type: "Publique", description: "Agro-industrie, mines, entrepreneuriat." },
  { nom: "Université Sourakhata Cissé de Bakel", ville: "Bakel", type: "Publique", description: "Développement local, agriculture, environnement." },
  { nom: "Institut Supérieur de Management (ISM)", ville: "Dakar", type: "Privée", description: "Commerce, gestion, informatique, communication." },
  { nom: "Université Dakar Bourguiba (UDB)", ville: "Dakar", type: "Privée", description: "Droit, sciences politiques, gestion." },
  { nom: "Institut Africain de Management (IAM)", ville: "Dakar", type: "Privée", description: "Gestion, commerce international, finance." },
  { nom: "Université Numérique Cheikh Hamidou Kane (UN-CHK)", ville: "En ligne", type: "Publique", description: "Formations à distance, tous domaines." },
  { nom: "Institut Supérieur d'Informatique (ISI)", ville: "Dakar", type: "Privée", description: "Informatique, réseaux, développement web." },
  { nom: "Université Catholique de l'Afrique de l'Ouest (UCAO)", ville: "Dakar", type: "Privée", description: "Sciences sociales, gestion, théologie." },
]

const MOTS_IGNORES = ["de", "du", "des", "la", "le", "les", "d'", "l'"]

/* Sigle entre parenthèses, sinon initiales des mots principaux du nom */
function obtenirSigle(nom: string) {
  const entreParentheses = nom.match(/\(([^)]+)\)/)
  if (entreParentheses) return entreParentheses[1]

  return nom
    .split(/\s+/)
    .filter((mot) => !MOTS_IGNORES.includes(mot.toLowerCase()))
    .map((mot) => mot.charAt(0).toUpperCase())
    .join("")
}

const STYLES_BADGE = {
  Publique: "bg-green-100 text-green-800",
  "Privée": "bg-orange-100 text-orange-800",
} as const

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
      { threshold: 0.15 }
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

export default function Universites() {
  const router = useRouter()

  /* Retour à la page précédente, ou à l'accueil si aucun historique */
  const retourner = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

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
          className="text-lg font-extrabold tracking-tight text-blue-900 transition-transform duration-300 hover:scale-105 sm:text-xl"
        >
          Orientation<span className="text-blue-500">SN</span>
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
        <div className="mb-8 sm:mb-10">
          <Reveal>
            <h1 className="mb-2 text-2xl font-bold sm:text-3xl">
              Universités du Sénégal
            </h1>
          </Reveal>
          <Reveal delay={100}>
            <p className="text-gray-500">
              Publiques et privées, réparties dans tout le pays
            </p>
          </Reveal>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {universites.map((u, index) => (
            <Reveal
              key={u.nom}
              delay={(index % 3) * 100}
              className="h-full"
            >
              <div className="group flex h-full flex-col rounded-2xl border bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex h-14 min-w-14 items-center justify-center rounded-xl bg-blue-900 px-2 text-sm font-bold text-white transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                    {obtenirSigle(u.nom)}
                  </div>
                  <span
                    className={
                      "rounded-full px-3 py-1 text-xs font-medium " +
                      STYLES_BADGE[u.type]
                    }
                  >
                    {u.type}
                  </span>
                </div>

                <h3 className="mb-1 text-base font-bold sm:text-lg">{u.nom}</h3>
                <p className="mb-3 text-sm text-gray-400">📍 {u.ville}</p>
                <p className="flex-1 text-sm text-gray-600">{u.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}