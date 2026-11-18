"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type ReactNode } from "react"

const services = [
  {
    href: "/filieres",
    emoji: "📚",
    titre: "Filières",
    texte:
      "Explore les formations et découvre les domaines qui correspondent à ton profil.",
    cta: "Explorer",
    iconBg: "bg-indigo-50",
    balayage: "from-indigo-700 to-violet-600",
  },
  {
    href: "/universites",
    emoji: "🏫",
    titre: "Universités",
    texte:
      "Découvre les universités et établissements d'enseignement supérieur au Sénégal.",
    cta: "Découvrir",
    iconBg: "bg-cyan-50",
    balayage: "from-cyan-600 to-blue-700",
  },
  {
    href: "/concours",
    emoji: "🏆",
    titre: "Concours",
    texte:
      "Retrouve les grandes écoles et les concours accessibles aux étudiants sénégalais.",
    cta: "Voir les concours",
    iconBg: "bg-amber-50",
    balayage: "from-orange-500 to-amber-600",
  },
  {
    href: "/conseils",
    emoji: "💡",
    titre: "Conseils",
    texte:
      "Méthodes et informations utiles pour réussir ton parcours après le bac.",
    cta: "Lire les conseils",
    iconBg: "bg-emerald-50",
    balayage: "from-emerald-600 to-green-700",
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
          : "translate-y-8 opacity-0 motion-reduce:opacity-100") +
        " " +
        className
      }
    >
      {children}
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <style jsx global>{`
        /* Sama AI : bouton flottant en bas à droite, toujours visible */
        button[aria-label="Ouvrir Sama AI"] {
          position: fixed !important;
          top: auto !important;
          right: 24px !important;
          bottom: 24px !important;
          left: auto !important;
          z-index: 1000 !important;
        }

        /* Fenêtre de discussion au-dessus du bouton */
        button[aria-label="Ouvrir Sama AI"] ~ div {
          position: fixed !important;
          top: auto !important;
          right: 24px !important;
          bottom: 96px !important;
          left: auto !important;
          z-index: 999 !important;
          max-height: min(600px, calc(100vh - 120px)) !important;
        }

        @media (max-width: 480px) {
          button[aria-label="Ouvrir Sama AI"] {
            right: 16px !important;
            bottom: 16px !important;
          }

          button[aria-label="Ouvrir Sama AI"] ~ div {
            right: 12px !important;
            bottom: 82px !important;
            width: calc(100vw - 24px) !important;
            max-width: 380px !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-cyan-500 text-lg font-black text-white shadow-lg">
              O
            </div>

            <div>
              <p className="text-lg font-black tracking-tight">
                Orientation<span className="text-indigo-700">SN</span>
              </p>

              <p className="text-[10px] text-slate-500">
                Ton avenir commence ici 🇸🇳
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
            <Link href="/" className="text-indigo-700 hover:text-indigo-900">
              Accueil
            </Link>

            <Link href="/filieres" className="text-slate-600 hover:text-indigo-700">
              Filières
            </Link>

            <Link href="/universites" className="text-slate-600 hover:text-indigo-700">
              Universités
            </Link>

            <Link href="/conseils" className="text-slate-600 hover:text-indigo-700">
              Conseils
            </Link>

            <Link href="/concours" className="text-slate-600 hover:text-indigo-700">
              Concours
            </Link>
          </nav>

          <Link
            href="/test"
            className="rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-800"
          >
            Faire le test
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-indigo-950/90 to-indigo-900/60" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-24 lg:grid-cols-2 lg:px-8 lg:py-32">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
              🇸🇳 La plateforme d'orientation des étudiants sénégalais
            </div>

            <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Construis ton avenir
              <span className="block bg-gradient-to-r from-cyan-300 via-white to-indigo-300 bg-clip-text text-transparent">
                au Sénégal.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Découvre les filières, universités, grandes écoles et concours
              disponibles au Sénégal. Fais les bons choix après ton bac et
              construis un projet d'avenir qui te ressemble.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/test"
                className="rounded-xl bg-white px-6 py-3.5 text-center text-sm font-extrabold text-indigo-800 shadow-xl hover:bg-slate-100"
              >
                🎯 Trouver ma filière
              </Link>

              <Link
                href="/universites"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-center text-sm font-extrabold text-white backdrop-blur hover:bg-white/20"
              >
                Découvrir les universités
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-white/15 pt-7">
              <div>
                <p className="text-2xl font-black text-white">+50</p>
                <p className="mt-1 text-xs text-slate-300">Filières</p>
              </div>

              <div>
                <p className="text-2xl font-black text-white">+20</p>
                <p className="mt-1 text-xs text-slate-300">Établissements</p>
              </div>

              <div>
                <p className="text-2xl font-black text-white">🇸🇳</p>
                <p className="mt-1 text-xs text-slate-300">Sénégal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES : liste en colonne */}
      <section className="overflow-hidden bg-slate-50 px-5 py-20 lg:px-8">
        <style>{`
          @keyframes cadreFlux {
            from { background-position: 0% 50%; }
            to { background-position: 200% 50%; }
          }
          @keyframes eclat {
            0% { transform: translateX(-150%) skewX(-20deg); }
            60%, 100% { transform: translateX(300%) skewX(-20deg); }
          }
          @keyframes flecheVa {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(5px); }
          }
          .cta-cadre {
            background-image: linear-gradient(90deg, #4338ca, #06b6d4, #8b5cf6, #f59e0b, #4338ca);
            background-size: 200% 100%;
            animation: cadreFlux 3s linear infinite;
          }
          .cta-eclat {
            animation: eclat 2.8s ease-in-out infinite;
          }
          .cta-fleche {
            animation: flecheVa 1.4s ease-in-out infinite;
          }
          .group:hover .cta-fleche {
            animation-duration: 0.6s;
          }
          @media (prefers-reduced-motion: reduce) {
            .cta-cadre, .cta-eclat, .cta-fleche { animation: none; }
          }
        `}</style>

        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <span className="text-sm font-black uppercase tracking-widest text-indigo-700">
                OrientationSN
              </span>

              <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Tout ce qu'il te faut après le bac
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Une plateforme pensée pour les lycéens et étudiants qui veulent
                comprendre leurs possibilités et préparer leur avenir.
              </p>
            </Reveal>
          </div>

          <div className="flex flex-col gap-4 sm:gap-5">
            {services.map((service, index) => (
              <Reveal key={service.href} delay={index * 120}>
                <Link
                  href={service.href}
                  className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-xl active:scale-[0.98] sm:gap-6 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className={
                      "absolute inset-0 -translate-x-full bg-gradient-to-r transition-transform duration-500 ease-out group-hover:translate-x-0 group-active:translate-x-0 motion-reduce:transition-none " +
                      service.balayage
                    }
                  />

                  <span
                    aria-hidden="true"
                    className="absolute right-5 top-2 text-5xl font-black text-slate-100 transition-colors duration-300 group-hover:text-white/15 sm:text-6xl"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div
                    className={
                      "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl transition-transform duration-300 group-hover:rotate-6 group-hover:scale-110 sm:h-16 sm:w-16 sm:text-3xl " +
                      service.iconBg
                    }
                  >
                    {service.emoji}
                  </div>

                  <div className="relative min-w-0 flex-1">
                    <h3 className="text-lg font-black text-slate-900 transition-colors duration-300 group-hover:text-white sm:text-xl">
                      {service.titre}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-slate-600 transition-colors duration-300 group-hover:text-white/90">
                      {service.texte}
                    </p>

                    <span className="cta-cadre mt-4 inline-flex rounded-full p-[2px] shadow-md transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                      <span className="relative flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2 text-sm font-bold text-indigo-700 transition-colors duration-300 group-hover:bg-white/95">
                        <span
                          aria-hidden="true"
                          className="cta-eclat pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-200/60 to-transparent"
                        />

                        <span className="relative">{service.cta}</span>

                        <span
                          aria-hidden="true"
                          className="cta-fleche relative"
                        >
                          →
                        </span>
                      </span>
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRÉSENTATION DU FONDATEUR */}
      <section className="relative overflow-hidden bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 px-5 py-20 text-white lg:px-8">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-indigo-400/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-black uppercase tracking-[0.1em] text-cyan-50"></span>

            <h2 className="mt-1 text-3xl font-black sm:text-4xl">
              Je me nomme Cheikh Sadibou
            </h2>

            <p className="mt-5 leading-8 text-indigo-100">
              Élève ingénieur en génie informatique à l'École supérieure
              polytechnique de Diamniadio. J'ai créé ce site pour venir en aide
              aux nouveaux bacheliers dans leur orientation. Partagez, s'il
              vous plaît, le site.
            </p>

            <p className="mt-5 text-lg font-semibold text-indigo-100">
              Science • Savoir • Excellence
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold">
                🔬 Science
              </span>

              <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-bold">
                📖 Éducation
              </span>
            </div>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-2 shadow-2xl backdrop-blur">
              <img
                src="/photo-cheikh.jpg"
                alt="Photo de Cheikh Sadibou"
                className="h-[380px] w-full rounded-2xl object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* POURQUOI ORIENTATIONSN */}
      <section className="bg-slate-50 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-black uppercase tracking-widest text-indigo-700">
              Pourquoi OrientationSN ?
            </span>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Plus qu'un simple site d'information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              Nous voulons rendre l'orientation scolaire et universitaire plus
              simple, plus claire et plus accessible.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-2xl">
                🧭
              </div>

              <h3 className="mt-6 text-xl font-black">Mieux s'orienter</h3>

              <p className="mt-3 leading-7 text-slate-600">
                Comprends les différentes possibilités avant de choisir ton
                parcours universitaire ou professionnel.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-2xl">
                📊
              </div>

              <h3 className="mt-6 text-xl font-black">
                Comparer les possibilités
              </h3>

              <p className="mt-3 leading-7 text-slate-600">
                Compare les filières, établissements et concours afin de
                mieux comprendre tes options.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-2xl">
                🚀
              </div>

              <h3 className="mt-6 text-xl font-black">Préparer son avenir</h3>

              <p className="mt-3 leading-7 text-slate-600">
                Passe de l'incertitude à un véritable projet d'études avec des
                informations utiles et accessibles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CHIFFRES */}
      <section className="bg-white px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl bg-indigo-50 p-7 text-center">
            <p className="text-4xl font-black text-indigo-700">+50</p>
            <p className="mt-2 font-semibold text-slate-700">
              Filières à découvrir
            </p>
          </div>

          <div className="rounded-3xl bg-cyan-50 p-7 text-center">
            <p className="text-4xl font-black text-cyan-700">+20</p>
            <p className="mt-2 font-semibold text-slate-700">Établissements</p>
          </div>

          <div className="rounded-3xl bg-amber-50 p-7 text-center">
            <p className="text-4xl font-black text-amber-600">🏆</p>
            <p className="mt-2 font-semibold text-slate-700">Concours</p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-7 text-center">
            <p className="text-4xl font-black text-emerald-600">🇸🇳</p>
            <p className="mt-2 font-semibold text-slate-700">100% Sénégal</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-700 via-violet-600 to-cyan-500 p-8 text-center shadow-2xl sm:p-12 lg:p-16">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-white/80">
            Ton avenir commence maintenant
          </p>

          <h2 className="mt-4 text-3xl font-black text-white sm:text-4xl lg:text-5xl">
            Tu ne sais pas encore quelle voie choisir ?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/85">
            Réponds à quelques questions et découvre les filières qui peuvent
            correspondre à ton profil.
          </p>

          <Link
            href="/test"
            className="mt-8 inline-flex rounded-xl bg-white px-7 py-3.5 text-sm font-black text-indigo-700 shadow-xl hover:bg-slate-100"
          >
            🎓 Commencer mon test d'orientation
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-slate-950 px-5 py-10 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-8 md:flex-row">
          <div>
            <p className="text-xl font-black">
              Orientation<span className="text-cyan-400">SN</span>
            </p>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              Une plateforme dédiée à l'orientation des lycéens et étudiants
              au Sénégal.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm text-slate-400">
            <Link href="/filieres" className="hover:text-white">
              Filières
            </Link>

            <Link href="/universites" className="hover:text-white">
              Universités
            </Link>

            <Link href="/concours" className="hover:text-white">
              Concours
            </Link>

            <Link href="/conseils" className="hover:text-white">
              Conseils
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl border-t border-white/10 pt-6 text-xs text-slate-500">
          © 2026 OrientationSN — Orientation et information au Sénégal 🇸🇳
        </div>
      </footer>
    </main>
  )
}