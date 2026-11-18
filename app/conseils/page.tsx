"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

const conseils = [
  {
    emoji: "🧮",
    titre: "Vous êtes très à l'aise en mathématiques et en physique",
    texte: "Si vous obtenez d'excellents résultats dans ces matières et que vous aimez résoudre des problèmes scientifiques, les écoles d'ingénieurs peuvent être un excellent choix. Pensez à tenter les concours de l'EPT, de l'ESP, de Polytech Diamniadio, de l'IPSL, de l'ISFAR ainsi que d'autres écoles d'ingénieurs.",
  },
  {
    emoji: "🧬",
    titre: "Vous êtes meilleur en SVT avec un bon niveau en mathématiques et physique",
    texte: "Si les sciences de la vie vous passionnent, vous pouvez envisager des études en médecine, pharmacie, odontologie, biologie ou dans d'autres filières des sciences de la santé. Les concours de l'EMS et les formations proposées par l'UCAD constituent également de bonnes opportunités.",
  },
  {
    emoji: "📊",
    titre: "Les matières scientifiques ne sont pas votre point fort",
    texte: "Ne vous découragez pas. De nombreuses filières offrent d'excellentes perspectives d'avenir, notamment l'économie, la gestion (FASEG), le management, la comptabilité, la finance et d'autres domaines des sciences humaines et sociales.",
  },
  {
    emoji: "⚙️",
    titre: "Vous souhaitez devenir ingénieur",
    texte: "Si votre objectif est une carrière d'ingénieur, pensez également à vous renseigner sur le concours de l'UAM ainsi que sur les autres écoles d'ingénieurs reconnues. Une bonne préparation augmente vos chances de réussite.",
  },
  {
    emoji: "⚖️",
    titre: "Vous êtes titulaire d'un baccalauréat littéraire (L)",
    texte: "Les études en droit, en sciences juridiques, en administration publique, ainsi que les concours du CREM et de la FASTEF, représentent d'excellentes possibilités selon votre projet professionnel.",
  },
]

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

export default function Conseils() {
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

      <header className="header-anim sticky top-0 z-50 flex items-center justify-between border-b bg-white/95 px-4 py-4 backdrop-blur sm:px-8">
        <a
          href="/"
          className="text-lg font-extrabold tracking-tight text-blue-900 transition-transform duration-300 hover:scale-105 sm:text-xl"
        >
          Orientation<span className="text-blue-500">SN</span>
        </a>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-8 sm:py-16">
        <Reveal>
          <h1 className="mb-3 text-2xl font-bold sm:text-3xl">
            Conseils d'orientation
          </h1>
        </Reveal>

        <Reveal delay={100}>
          <p className="mb-8 leading-relaxed text-gray-600 sm:mb-10">
            Le choix d'une filière ne dépend pas uniquement de vos notes. Vos compétences, vos centres
            d'intérêt, votre motivation et votre projet professionnel sont tout aussi importants.
            Les conseils ci-dessous sont donnés à titre indicatif.
          </p>
        </Reveal>

        <div className="space-y-4 sm:space-y-6">
          {conseils.map((c, index) => (
            <Reveal key={c.titre} delay={index * 100}>
              <div className="group rounded-2xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className="shrink-0 text-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-125 sm:text-3xl"
                    aria-hidden="true"
                  >
                    {c.emoji}
                  </div>
                  <div className="min-w-0">
                    <h3 className="mb-2 text-base font-bold sm:text-lg">
                      {c.titre}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 sm:text-base">
                      {c.texte}
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-8 sm:mt-10">
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 transition-shadow duration-300 hover:shadow-md sm:p-6">
            <p className="mb-1 font-bold text-blue-900">Important</p>
            <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
              Aucune filière n'est meilleure qu'une autre. La réussite dépend surtout de votre
              motivation, de votre travail, de vos compétences et de votre persévérance. Choisissez
              une formation qui correspond à votre profil et à vos ambitions.
            </p>
          </div>
        </Reveal>
      </section>
    </main>
  )
}