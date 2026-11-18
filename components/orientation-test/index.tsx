"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { SERIES, CONCOURS_INFO } from "./data"

import type {
    ConfigurationSerie,
    NiveauAdmission,
    Notes,
    SerieId,
} from "./types"

import { orienterS1 } from "./series/S1"
import { orienterS2 } from "./series/S2"
import { orienterS3 } from "./series/S3"
import { orienterL1 } from "./series/L1"
import { orienterL2 } from "./series/L2"
import { orienterSTEG } from "./series/STEG"
import { orienterT } from "./series/T"

type Groupe = "premier-tour" | "second-tour" | "non-admis"

type Etape = "accueil" | "serie" | "notes" | "moyenne" | "filieres" | "concours"

type ResultatTest = {
    serie: SerieId
    moyenneBac: number
    moyenneMatieres: number
    niveau: NiveauAdmission
    groupe: Groupe
    mention: string
    admis: boolean
    filieres: string[]
    concours: string[]
    notes: Notes
}

/* =========================================================
   PROFIL TRANSMIS À SAMA AI
========================================================= */

type NotesSamaAI = {
    mathematiques: number | null
    physiqueChimie: number | null
    svt: number | null
    francais: number | null
    philosophie: number | null
    anglais: number | null
    histoireGeographie: number | null
}

type ProfilSamaAI = {
    serie: string
    notes: NotesSamaAI
    moyenneBac: number
    moyenneMatieres: number
    niveau: string
    mention: string
    filieresRecommandees: string[]
    concoursRecommandes: string[]
    dateTest: string
}

const CLE_PROFIL_SAMA_AI = "orientationSN_profil"

function trouverNoteMatiere(
    notes: Notes,
    configuration: ConfigurationSerie,
    motsCles: string[]
): number | null {
    for (const matiere of configuration.matieres) {
        const identifiant = matiere.id.toLowerCase()
        const label = matiere.label.toLowerCase()

        const correspond = motsCles.some((mot) =>
            `${identifiant} ${label}`.includes(mot)
        )

        if (correspond) {
            const valeur = notes[matiere.id]

            if (typeof valeur === "number") {
                return valeur
            }
        }
    }

    return null
}

function creerProfilSamaAI(
    resultat: ResultatTest,
    configuration: ConfigurationSerie
): ProfilSamaAI {
    const notes: NotesSamaAI = {
        mathematiques: trouverNoteMatiere(resultat.notes, configuration, [
            "math",
            "mathematique",
        ]),
        physiqueChimie: trouverNoteMatiere(resultat.notes, configuration, [
            "physique",
            "chimie",
        ]),
        svt: trouverNoteMatiere(resultat.notes, configuration, [
            "svt",
            "science de la vie",
            "biologie",
        ]),
        francais: trouverNoteMatiere(resultat.notes, configuration, [
            "francais",
            "français",
        ]),
        philosophie: trouverNoteMatiere(resultat.notes, configuration, [
            "philosophie",
            "philo",
        ]),
        anglais: trouverNoteMatiere(resultat.notes, configuration, [
            "anglais",
            "english",
        ]),
        histoireGeographie: trouverNoteMatiere(resultat.notes, configuration, [
            "histoire",
            "geographie",
            "géographie",
        ]),
    }

    return {
        serie: resultat.serie,
        notes,
        moyenneBac: resultat.moyenneBac,
        moyenneMatieres: resultat.moyenneMatieres,
        niveau: resultat.niveau,
        mention: resultat.mention,
        filieresRecommandees: resultat.filieres,
        concoursRecommandes: resultat.concours,
        dateTest: new Date().toISOString(),
    }
}

function enregistrerProfilSamaAI(profil: ProfilSamaAI): boolean {
    try {
        localStorage.setItem(CLE_PROFIL_SAMA_AI, JSON.stringify(profil))

        const profilEnregistre = localStorage.getItem(CLE_PROFIL_SAMA_AI)

        if (!profilEnregistre) {
            return false
        }

        const verification = JSON.parse(profilEnregistre)

        return (
            verification.serie === profil.serie &&
            verification.moyenneBac === profil.moyenneBac
        )
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du profil Sama AI :", error)
        return false
    }
}

/* =========================================================
   CALCULS
========================================================= */

const COULEURS_SERIES: Record<SerieId, string> = {
    S1: "from-blue-600 to-sky-400",
    S2: "from-cyan-600 to-blue-400",
    S3: "from-indigo-600 to-blue-400",
    L1: "from-blue-700 to-indigo-400",
    L2: "from-sky-600 to-cyan-400",
    STEG: "from-blue-600 to-indigo-500",
    T: "from-indigo-600 to-sky-400",
}

const NOMS_SERIES: Record<SerieId, string> = {
    S1: "Maths & Physique",
    S2: "Sciences expérimentales",
    S3: "Sciences & Techniques",
    L1: "Lettres & Philosophie",
    L2: "Lettres & Langues",
    STEG: "Économie & Gestion",
    T: "Technique",
}

function obtenirMention(moyenne: number): string {
    if (moyenne >= 18) return "Excellent"
    if (moyenne >= 16) return "Très bien"
    if (moyenne >= 14) return "Bien"
    if (moyenne >= 12) return "Assez bien"
    if (moyenne >= 9.5) return "Passable"
    return "Non admis"
}

function obtenirNiveau(moyenne: number): NiveauAdmission {
    if (moyenne >= 18) return "excellent"
    if (moyenne >= 16) return "tresBien"
    if (moyenne >= 14) return "bien"
    if (moyenne >= 12) return "assezBien"
    if (moyenne >= 9.5) return "passable"
    if (moyenne >= 8) return "rattrapages"
    return "nonAdmis"
}

function calculerMoyenne(notes: number[]): number {
    if (!notes.length) return 0
    return notes.reduce((total, note) => total + note, 0) / notes.length
}

function convertirNote(valeur: string): number {
    return Number(valeur.trim().replace(",", "."))
}

function calculerOrientation(
    serie: SerieId,
    moyenneMatieres: number,
    moyenneBac: number,
    notes: Notes
) {
    switch (serie) {
        case "S1":
            return orienterS1(moyenneMatieres, moyenneBac)
        case "S2":
            return orienterS2(moyenneMatieres, moyenneBac, notes.svt ?? 0)
        case "S3":
            return orienterS3(moyenneMatieres, moyenneBac)
        case "L1":
            return orienterL1(moyenneMatieres, moyenneBac)
        case "L2":
            return orienterL2(moyenneMatieres, moyenneBac)
        case "STEG":
            return orienterSTEG(moyenneMatieres, moyenneBac)
        case "T":
            return orienterT(moyenneMatieres, moyenneBac)
    }
}

/* =========================================================
   ICÔNES
========================================================= */

function Icone({
    type,
    className = "h-6 w-6",
}: {
    type: "school" | "trophy" | "star" | "arrow" | "back" | "book" | "target" | "check"
    className?: string
}) {
    const chemins = {
        school: (
            <>
                <path d="m3 10 9-7 9 7" />
                <path d="M5 9v11h14V9" />
                <path d="M9 20v-6h6v6" />
            </>
        ),
        trophy: (
            <>
                <path d="M8 21h8M12 17v4" />
                <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
                <path d="M7 6H4v2a4 4 0 0 0 4 4" />
                <path d="M17 6h3v2a4 4 0 0 1-4 4" />
            </>
        ),
        star: (
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
        ),
        arrow: (
            <>
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
            </>
        ),
        back: (
            <>
                <path d="M19 12H5" />
                <path d="m11 6-6 6 6 6" />
            </>
        ),
        book: (
            <>
                <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
                <path d="M4 17a2.5 2.5 0 0 1 2.5-2.5H20" />
            </>
        ),
        target: (
            <>
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="12" cy="12" r="1" />
            </>
        ),
        check: <path d="m5 12 5 5 9-10" />,
    }

    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            {chemins[type]}
        </svg>
    )
}

/* =========================================================
   COMPOSANT PRINCIPAL
========================================================= */

const ORDRE_ETAPES: Etape[] = ["serie", "notes", "moyenne", "filieres", "concours"]

export default function OrientationTest() {
    const router = useRouter()

    const [etape, setEtape] = useState<Etape>("accueil")
    const [serie, setSerie] = useState<SerieId>("S1")
    const [notesSaisies, setNotesSaisies] = useState<Record<string, string>>({})
    const [moyenneBacSaisie, setMoyenneBacSaisie] = useState("")
    const [resultat, setResultat] = useState<ResultatTest | null>(null)
    const [erreur, setErreur] = useState("")
    const [chargement, setChargement] = useState(false)

    const configuration: ConfigurationSerie | undefined = useMemo(
        () => SERIES.find((element) => element.id === serie),
        [serie]
    )

    /* ---------- Navigation ---------- */

    function aller(nouvelleEtape: Etape) {
        setErreur("")
        setEtape(nouvelleEtape)
    }

    function choisirSerie(nouvelleSerie: SerieId) {
        if (nouvelleSerie !== serie) {
            setNotesSaisies({})
            setMoyenneBacSaisie("")
            setResultat(null)
        }

        setSerie(nouvelleSerie)
        aller("notes")
    }

    /* ---------- Saisie ---------- */

    function modifierNote(id: string, valeur: string) {
        const valeurNettoyee = valeur.replace(/[^0-9.,]/g, "")

        setNotesSaisies((anciennes) => ({
            ...anciennes,
            [id]: valeurNettoyee,
        }))

        setErreur("")
    }

    /* ---------- Contrôle des notes ---------- */

    function validerNotes(): boolean {
        if (!configuration) {
            setErreur("Série introuvable.")
            return false
        }

        let auMoinsUne = false

        for (const matiere of configuration.matieres) {
            const valeur = notesSaisies[matiere.id]?.trim()

            if (!valeur) {
                if (matiere.obligatoire) {
                    setErreur(`${matiere.label} : note obligatoire.`)
                    return false
                }
                continue
            }

            const note = convertirNote(valeur)

            if (!Number.isFinite(note) || note < 0 || note > 20) {
                setErreur(`${matiere.label} : entre une note de 0 à 20.`)
                return false
            }

            auMoinsUne = true
        }

        if (!auMoinsUne) {
            setErreur("Saisis au moins une note.")
            return false
        }

        return true
    }

    function continuerNotes() {
        if (validerNotes()) {
            aller("moyenne")
        }
    }

    /* ---------- Contrôle de la moyenne + calcul ---------- */

    function analyser() {
        setErreur("")

        if (!configuration) {
            setErreur("Série introuvable.")
            return
        }

        const moyenneBac = convertirNote(moyenneBacSaisie)

        if (
            !moyenneBacSaisie.trim() ||
            !Number.isFinite(moyenneBac) ||
            moyenneBac < 0 ||
            moyenneBac > 20
        ) {
            setErreur("Entre une moyenne de 0 à 20.")
            return
        }

        setChargement(true)

        try {
            const notesValidees: Notes = {}
            const notesNumeriques: number[] = []

            for (const matiere of configuration.matieres) {
                const valeur = notesSaisies[matiere.id]?.trim()

                if (!valeur) continue

                const note = convertirNote(valeur)
                notesValidees[matiere.id] = note
                notesNumeriques.push(note)
            }

            const moyenneMatieres = calculerMoyenne(notesNumeriques)

            const groupe: Groupe =
                moyenneBac >= 10
                    ? "premier-tour"
                    : moyenneBac >= 8
                        ? "second-tour"
                        : "non-admis"

            const orientation = calculerOrientation(
                serie,
                moyenneMatieres,
                moyenneBac,
                notesValidees
            )

            const nouveauResultat: ResultatTest = {
                serie,
                moyenneBac,
                moyenneMatieres,
                niveau: obtenirNiveau(moyenneBac),
                groupe,
                mention: obtenirMention(moyenneBac),
                admis: moyenneBac >= 10,
                filieres: orientation.filieres ?? [],
                concours: orientation.concours ?? [],
                notes: notesValidees,
            }

            const profilSamaAI = creerProfilSamaAI(nouveauResultat, configuration)

            if (!enregistrerProfilSamaAI(profilSamaAI)) {
                console.error("Le profil n'a pas pu être enregistré pour Sama AI.")
            }

            setResultat(nouveauResultat)
            setEtape("filieres")
        } catch (error) {
            console.error(error)
            setErreur("Une erreur est survenue pendant le calcul.")
        } finally {
            setChargement(false)
        }
    }

    /* ---------- Progression ---------- */

    const indexEtape = ORDRE_ETAPES.indexOf(etape)

    const notesRemplies = configuration
        ? configuration.matieres.filter((m) => notesSaisies[m.id]?.trim()).length
        : 0

    /* ---------- Rendu ---------- */

    return (
        <main className="orientation-page min-h-screen bg-slate-50 text-slate-800">
            <style jsx global>{`
        @keyframes apparition {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes glisse {
          from { opacity: 0; transform: translateX(28px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes flotte {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulsation {
          0% { box-shadow: 0 0 0 0 rgba(29, 78, 216, 0.45); }
          100% { box-shadow: 0 0 0 18px rgba(29, 78, 216, 0); }
        }

        @keyframes vague {
          from { transform: translate(0, 0); }
          to { transform: translate(40px, -30px); }
        }

        @keyframes secoue {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .animation-apparition { animation: apparition 0.5s ease both; }
        .animation-glisse { animation: glisse 0.45s ease both; }
        .animation-flotte { animation: flotte 3.2s ease-in-out infinite; }
        .animation-pulsation { animation: pulsation 1.8s ease-out infinite; }
        .animation-secoue { animation: secoue 0.35s ease; }

        .bulle {
          position: absolute;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.12);
          animation: vague 7s ease-in-out infinite alternate;
        }

        .carte-serie,
        .carte-choix {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .carte-serie:hover,
        .carte-choix:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 14px 30px rgba(29, 78, 216, 0.18);
        }

        .carte-serie:active { transform: scale(0.97); }

        .champ-note {
          width: 100%;
          border: 2px solid #bfdbfe;
          border-radius: 12px;
          background: #ffffff;
          padding: 14px 16px;
          color: #172554;
          font-size: 20px;
          font-weight: 700;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .champ-note:focus {
          border-color: #1d4ed8;
          box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.15);
        }

        .champ-note::placeholder {
          color: #94a3b8;
          font-weight: 500;
        }

        .bouton-principal {
          transition: transform 0.15s ease, background-color 0.2s ease;
        }
        .bouton-principal:hover { transform: translateY(-2px); }
        .bouton-principal:active { transform: scale(0.97); }

        @media (prefers-reduced-motion: reduce) {
          .animation-apparition,
          .animation-glisse,
          .animation-flotte,
          .animation-pulsation,
          .animation-secoue,
          .bulle {
            animation: none !important;
          }

          .carte-serie,
          .carte-choix,
          .bouton-principal {
            transition: none !important;
          }

          .carte-serie:hover,
          .carte-choix:hover,
          .bouton-principal:hover {
            transform: none !important;
          }
        }
      `}</style>

            {/* En-tête */}
            <header className="border-b border-blue-100 bg-white">
                <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white">
                            <Icone type="school" />
                        </div>

                        <p className="text-xl font-extrabold tracking-tight text-blue-950">
                            Orientation<span className="text-blue-600">SN</span>
                        </p>
                    </div>

                    {etape !== "accueil" && (
                        <button
                            type="button"
                            onClick={() => router.push("/")}
                            className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-800 transition hover:bg-blue-100"
                        >
                            Accueil
                        </button>
                    )}
                </div>

                {/* Barre de progression */}
                {etape !== "accueil" && (
                    <div className="h-1.5 w-full bg-blue-100">
                        <div
                            className="h-full rounded-r-full bg-gradient-to-r from-blue-700 to-sky-400 transition-all duration-700"
                            style={{
                                width: `${((indexEtape + 1) / ORDRE_ETAPES.length) * 100}%`,
                            }}
                        />
                    </div>
                )}
            </header>

            {/* Bandeau bleu animé */}
            <section className="relative overflow-hidden bg-blue-700 text-white">
                <span className="bulle -left-10 top-4 h-40 w-40" />
                <span
                    className="bulle right-10 top-10 h-24 w-24"
                    style={{ animationDelay: "1.2s" }}
                />
                <span
                    className="bulle bottom-0 left-1/3 h-32 w-32"
                    style={{ animationDelay: "2.4s" }}
                />

                <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-10 text-center sm:px-6">
                    <div className="animation-flotte mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-700">
                        <Icone type="target" className="h-8 w-8" />
                    </div>

                    <h1 className="mt-4 text-2xl font-extrabold sm:text-4xl">
                        Test d'orientation post-bac
                    </h1>
                </div>
            </section>

            <div className="relative z-10 mx-auto -mt-12 max-w-5xl px-4 pb-12 sm:px-6">

                {/* ================= ACCUEIL ================= */}

                {etape === "accueil" && (
                    <section
                        key="accueil"
                        className="animation-apparition mx-auto max-w-xl rounded-3xl border border-blue-100 bg-white p-8 text-center shadow-xl shadow-blue-900/10 sm:p-12"
                    >
                        <div className="animation-pulsation mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                            <Icone type="school" className="h-9 w-9" />
                        </div>

                        <h2 className="mt-6 text-3xl font-extrabold text-blue-950">
                            Bienvenue
                        </h2>

                        <button
                            type="button"
                            onClick={() => aller("serie")}
                            className="bouton-principal mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-700 px-8 py-5 text-lg font-extrabold text-white shadow-lg hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                        >
                            Commencer
                            <Icone type="arrow" />
                        </button>
                    </section>
                )}

                {/* ================= PAGE 1 : SÉRIE ================= */}

                {etape === "serie" && (
                    <section
                        key="serie"
                        className="animation-glisse rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-10"
                    >
                        <h2 className="text-center text-2xl font-extrabold text-blue-950 sm:text-3xl">
                            Quelle est ta série ?
                        </h2>

                        <div className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
                            {SERIES.map((element, index) => (
                                <button
                                    key={element.id}
                                    type="button"
                                    onClick={() => choisirSerie(element.id)}
                                    style={{ animationDelay: `${index * 70}ms` }}
                                    className="carte-serie animation-apparition group flex items-center gap-4 rounded-2xl border border-blue-100 bg-white p-3 pr-4 text-left shadow-sm hover:border-blue-400 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                                >
                                    <span
                                        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${COULEURS_SERIES[element.id]} text-sm font-bold tracking-wide text-white shadow-md`}
                                    >
                                        {element.id}
                                    </span>

                                    <span className="flex-1 text-[15px] font-semibold leading-5 text-blue-950">
                                        {NOMS_SERIES[element.id]}
                                    </span>

                                    <span className="text-blue-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-blue-600">
                                        <Icone type="arrow" className="h-5 w-5" />
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* ================= PAGE 2 : NOTES ================= */}

                {etape === "notes" && configuration && (
                    <section
                        key="notes"
                        className="animation-glisse rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-10"
                    >
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">
                                Quelles sont tes notes ?
                            </h2>

                            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                                {serie} · {NOMS_SERIES[serie]}
                            </span>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-blue-100">
                                <div
                                    className="h-full rounded-full bg-blue-700 transition-all duration-500"
                                    style={{
                                        width: `${(notesRemplies / configuration.matieres.length) * 100}%`,
                                    }}
                                />
                            </div>

                            <span className="text-sm font-bold text-blue-700">
                                {notesRemplies}/{configuration.matieres.length}
                            </span>
                        </div>

                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            {configuration.matieres.map((matiere, index) => (
                                <div
                                    key={matiere.id}
                                    style={{ animationDelay: `${index * 60}ms` }}
                                    className="animation-apparition rounded-2xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <label
                                        htmlFor={`note-${matiere.id}`}
                                        className="mb-3 flex items-center justify-between gap-2 text-base font-bold text-blue-950"
                                    >
                                        <span>{matiere.label}</span>

                                        {matiere.obligatoire && (
                                            <span className="h-2.5 w-2.5 rounded-full bg-blue-700" />
                                        )}
                                    </label>

                                    <div className="relative">
                                        <input
                                            id={`note-${matiere.id}`}
                                            type="text"
                                            inputMode="decimal"
                                            autoComplete="off"
                                            placeholder="14,5"
                                            value={notesSaisies[matiere.id] ?? ""}
                                            onChange={(event) =>
                                                modifierNote(matiere.id, event.target.value)
                                            }
                                            className="champ-note pr-16"
                                            aria-label={`Note de ${matiere.label} sur 20`}
                                        />

                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-blue-600">
                                            /20
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {erreur && (
                            <div
                                key={erreur}
                                role="alert"
                                className="animation-secoue mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700"
                            >
                                {erreur}
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => aller("serie")}
                                className="bouton-principal flex items-center justify-center rounded-xl border-2 border-blue-200 px-5 py-4 text-blue-700 hover:bg-blue-50"
                                aria-label="Retour"
                            >
                                <Icone type="back" />
                            </button>

                            <button
                                type="button"
                                onClick={continuerNotes}
                                className="bouton-principal flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-4 text-base font-extrabold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                            >
                                Continuer
                                <Icone type="arrow" />
                            </button>
                        </div>
                    </section>
                )}

                {/* ================= PAGE 3 : MOYENNE ================= */}

                {etape === "moyenne" && (
                    <section
                        key="moyenne"
                        className="animation-glisse mx-auto max-w-xl rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-10"
                    >
                        <h2 className="text-center text-2xl font-extrabold text-blue-950 sm:text-3xl">
                            Quelle est ta moyenne ?
                        </h2>

                        <div className="relative mt-8">
                            <input
                                id="moyenne-bac"
                                type="text"
                                inputMode="decimal"
                                autoComplete="off"
                                autoFocus
                                placeholder="12,50"
                                value={moyenneBacSaisie}
                                onChange={(event) => {
                                    setMoyenneBacSaisie(
                                        event.target.value.replace(/[^0-9.,]/g, "")
                                    )
                                    setErreur("")
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter") analyser()
                                }}
                                className="champ-note pr-20 text-center text-3xl"
                                aria-label="Moyenne générale sur 20"
                            />

                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-blue-600">
                                /20
                            </span>
                        </div>

                        {erreur && (
                            <div
                                key={erreur}
                                role="alert"
                                className="animation-secoue mt-5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-bold text-rose-700"
                            >
                                {erreur}
                            </div>
                        )}

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => aller("notes")}
                                className="bouton-principal flex items-center justify-center rounded-xl border-2 border-blue-200 px-5 py-4 text-blue-700 hover:bg-blue-50"
                                aria-label="Retour"
                            >
                                <Icone type="back" />
                            </button>

                            <button
                                type="button"
                                onClick={analyser}
                                disabled={chargement}
                                className="bouton-principal flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-4 text-base font-extrabold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 disabled:opacity-50"
                            >
                                {chargement ? "Analyse..." : "Voir mes résultats"}
                                <Icone type="arrow" />
                            </button>
                        </div>
                    </section>
                )}

                {/* ================= PAGE 4 : FILIÈRES ================= */}

                {etape === "filieres" && resultat && (
                    <section
                        key="filieres"
                        className="animation-glisse rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-10"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                                    <Icone type="book" />
                                </div>

                                <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">
                                    Filières recommandées
                                </h2>
                            </div>

                            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-800">
                                {resultat.mention} · {resultat.moyenneBac.toFixed(2)}/20
                            </span>
                        </div>

                        {resultat.groupe === "second-tour" && (
                            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                                Deuxième groupe (moyenne entre 8 et 9.5).
                            </p>
                        )}

                        {resultat.groupe === "non-admis" && (
                            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700">
                                Moyenne inférieure à 8 : non admissible au deuxième groupe.
                            </p>
                        )}

                        {resultat.filieres.length ? (
                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {resultat.filieres.map((filiere, index) => (
                                    <div
                                        key={`${filiere}-${index}`}
                                        style={{ animationDelay: `${index * 90}ms` }}
                                        className="carte-choix animation-apparition flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 text-white">
                                            <Icone type="check" className="h-5 w-5" />
                                        </div>

                                        <p className="text-base font-bold leading-6 text-blue-950">
                                            {filiere}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                                Aucune filière proposée.
                            </p>
                        )}

                        <div className="mt-8 flex gap-3">
                            <button
                                type="button"
                                onClick={() => aller("moyenne")}
                                className="bouton-principal flex items-center justify-center rounded-xl border-2 border-blue-200 px-5 py-4 text-blue-700 hover:bg-blue-50"
                                aria-label="Retour"
                            >
                                <Icone type="back" />
                            </button>

                            <button
                                type="button"
                                onClick={() => aller("concours")}
                                className="bouton-principal flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-4 text-base font-extrabold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                            >
                                Voir les concours
                                <Icone type="arrow" />
                            </button>
                        </div>
                    </section>
                )}

                {/* ================= PAGE 5 : CONCOURS ================= */}

                {etape === "concours" && resultat && (
                    <section
                        key="concours"
                        className="animation-glisse rounded-3xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/10 sm:p-10"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                                    <Icone type="trophy" />
                                </div>

                                <h2 className="text-2xl font-extrabold text-blue-950 sm:text-3xl">
                                    Concours envisageables
                                </h2>
                            </div>

                            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-extrabold text-blue-800">
                                {resultat.concours.length}
                            </span>
                        </div>

                        {resultat.concours.length ? (
                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                {resultat.concours.map((concours, index) => (
                                    <article
                                        key={`${concours}-${index}`}
                                        style={{ animationDelay: `${index * 90}ms` }}
                                        className="carte-choix animation-apparition rounded-2xl border border-blue-100 bg-white p-5"
                                    >
                                        <div className="mb-3 flex items-center justify-between">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                <Icone type="star" className="h-5 w-5" />
                                            </div>

                                            <span className="text-sm font-extrabold text-blue-600">
                                                #{String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <h3 className="text-lg font-extrabold text-blue-950">
                                            {concours}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {CONCOURS_INFO[concours] ?? ""}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-6 rounded-xl bg-slate-50 p-5 text-sm text-slate-600">
                                Aucun concours proposé.
                            </p>
                        )}

                        <p className="mt-6 text-xs text-slate-500">
                            Indicatif. Vérifie les conditions auprès de chaque établissement.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => aller("filieres")}
                                className="bouton-principal flex items-center justify-center rounded-xl border-2 border-blue-200 px-5 py-4 text-blue-700 hover:bg-blue-50"
                                aria-label="Retour"
                            >
                                <Icone type="back" />
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push("/")}
                                className="bouton-principal flex flex-1 items-center justify-center gap-3 rounded-xl bg-blue-700 px-6 py-4 text-base font-extrabold text-white shadow-md shadow-blue-700/20 hover:bg-blue-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                            >
                                <Icone type="school" className="h-5 w-5" />
                                Accueil
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </main>
    )
}