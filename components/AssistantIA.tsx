"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import "katex/dist/katex.min.css";

// =======================================================
// 1. TYPES ET INTERFACES
// =======================================================

type SourceGoogle = {
    titre: string;
    url: string;
};

type Message = {
    role: "user" | "assistant";
    content: string;
    sources?: SourceGoogle[];
    rechercheGoogleEffectuee?: boolean;
};

type ProfilOrientation = {
    serie: string;

    notes: {
        mathematiques: number | null;
        physiqueChimie: number | null;
        svt: number | null;
        francais: number | null;
        philosophie: number | null;
        anglais: number | null;
        histoireGeographie: number | null;
    };

    moyenneBac: number;
    niveau: string;
    mention: string;
    filieresRecommandees: string[];
    dateTest: string;
};

type ReponseAPI = {
    answer?: string;
    error?: string;
    sources?: SourceGoogle[];
    rechercheGoogleEffectuee?: boolean;
};

// =======================================================
// 2. SUGGESTIONS DE QUESTIONS
// =======================================================

const SUGGESTIONS = [
    {
        titre: "Découvrir les filières",
        description: "Comprendre les différentes formations.",
        question: "Quelles sont les principales filières universitaires au Sénégal ?",
        icon: "book",
    },
    {
        titre: "Choisir une école",
        description: "Trouver un établissement adapté.",
        question: "Quelles sont les meilleures écoles pour étudier au Sénégal ?",
        icon: "school",
    },
    {
        titre: "Débouchés professionnels",
        description: "Découvrir les métiers possibles.",
        question: "Quels sont les débouchés après des études en génie informatique ?",
        icon: "briefcase",
    },
    {
        titre: "Analyser mon profil",
        description: "Obtenir des conseils personnalisés.",
        question: "Analyse mon profil scolaire et conseille-moi sur mon orientation.",
        icon: "chart",
    },
];

// =======================================================
// 3. COMPOSANT PRINCIPAL SAMA AI
// =======================================================

export default function AssistantIA() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [question, setQuestion] = useState("");

    const [profil, setProfil] =
        useState<ProfilOrientation | null>(null);

    const zoneMessagesRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([
        {
            role: "assistant",
            content:
                "Bonjour ! Je suis Sama AI, ton assistant intelligent d'OrientationSN. Pose-moi tes questions sur les études, les filières, les universités et l'orientation après le bac. Comment puis-je t'aider aujourd'hui ?",
        },
    ]);

    // ===================================================
    // 4. DÉFILEMENT AUTOMATIQUE DES MESSAGES
    // ===================================================

    useEffect(() => {
        if (zoneMessagesRef.current) {
            zoneMessagesRef.current.scrollTo({
                top: zoneMessagesRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages, loading]);

    // ===================================================
    // 5. RÉCUPÉRATION DU PROFIL D'ORIENTATION
    // ===================================================

    useEffect(() => {
        chargerProfil();
    }, []);

    function chargerProfil() {
        try {
            const donnees = localStorage.getItem(
                "orientationSN_profil"
            );

            if (donnees) {
                const profilEnregistre: ProfilOrientation =
                    JSON.parse(donnees);

                setProfil(profilEnregistre);
            } else {
                setProfil(null);
            }
        } catch (error) {
            console.error(
                "Erreur de récupération du profil :",
                error
            );

            setProfil(null);
        }
    }

    // ===================================================
    // 6. VALIDATION DES SOURCES GOOGLE
    // ===================================================

    function validerSources(
        sources: unknown
    ): SourceGoogle[] {
        if (!Array.isArray(sources)) {
            return [];
        }

        return sources
            .filter((source): source is SourceGoogle => {
                if (
                    !source ||
                    typeof source !== "object" ||
                    typeof source.titre !== "string" ||
                    typeof source.url !== "string"
                ) {
                    return false;
                }

                try {
                    const url = new URL(source.url);

                    return (
                        url.protocol === "https:" ||
                        url.protocol === "http:"
                    );
                } catch {
                    return false;
                }
            })
            .slice(0, 10);
    }

    // ===================================================
    // 7. ENVOI DU MESSAGE À SAMA AI
    // ===================================================

    async function envoyerMessage(
        e: FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (!question.trim() || loading) return;

        const nouveauMessage: Message = {
            role: "user",
            content: question.trim(),
        };

        const historique = [
            ...messages,
            nouveauMessage,
        ];

        setMessages(historique);
        setQuestion("");
        setLoading(true);

        try {
            let profilActuel = profil;

            try {
                const donnees = localStorage.getItem(
                    "orientationSN_profil"
                );

                if (donnees) {
                    profilActuel = JSON.parse(
                        donnees
                    ) as ProfilOrientation;

                    setProfil(profilActuel);
                }
            } catch (error) {
                console.error(
                    "Erreur de lecture du profil :",
                    error
                );
            }

            const response = await fetch("/api/assistant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messages: historique,
                    profil: profilActuel,
                }),
            });

            const data: ReponseAPI = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Erreur de communication"
                );
            }

            if (typeof data.answer !== "string") {
                throw new Error(
                    "La réponse de Sama AI est invalide."
                );
            }

            const sources = validerSources(data.sources);

            const rechercheGoogleEffectuee =
                data.rechercheGoogleEffectuee === true ||
                sources.length > 0;

            const reponseAssistant: Message = {
                role: "assistant",
                content: data.answer,
                sources,
                rechercheGoogleEffectuee,
            };

            setMessages([
                ...historique,
                reponseAssistant,
            ]);
        } catch (error) {
            console.error("Erreur Sama AI :", error);

            setMessages([
                ...historique,
                {
                    role: "assistant",
                    content:
                        "Désolé, une erreur est survenue. Réessaie dans quelques instants.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    // ===================================================
    // 8. UTILISER UNE SUGGESTION
    // ===================================================

    function utiliserSuggestion(texte: string) {
        if (loading) return;

        setQuestion(texte);
    }

    // ===================================================
    // 9. AFFICHAGE DES ICÔNES
    // ===================================================

    function afficherIcone(type: string) {
        const className = "h-5 w-5";

        switch (type) {
            case "book":
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z" />
                        <path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8M8 11h8" />
                    </svg>
                );

            case "school":
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="m3 10 9-7 9 7" />
                        <path d="M5 10v10h14V10M9 20v-6h6v6M2 21h20" />
                    </svg>
                );

            case "briefcase":
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="7" width="18" height="14" rx="2" />
                        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
                    </svg>
                );

            case "chart":
                return (
                    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <path d="M3 3v18h18" />
                        <path d="m7 14 4-4 4 3 6-7" />
                    </svg>
                );

            default:
                return null;
        }
    }

    // ===================================================
    // 10. AFFICHAGE PROFESSIONNEL DES RÉPONSES
    // ===================================================

    function afficherReponse(contenu: string) {
        return (
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="mb-3 mt-4 text-lg font-bold text-indigo-900">
                            {children}
                        </h1>
                    ),

                    h2: ({ children }) => (
                        <h2 className="mb-2 mt-4 border-b border-indigo-100 pb-2 text-base font-bold text-indigo-900">
                            {children}
                        </h2>
                    ),

                    h3: ({ children }) => (
                        <h3 className="mb-2 mt-3 text-sm font-bold text-indigo-800">
                            {children}
                        </h3>
                    ),

                    p: ({ children }) => (
                        <p className="mb-3 text-sm leading-7 text-gray-700 last:mb-0">
                            {children}
                        </p>
                    ),

                    strong: ({ children }) => (
                        <strong className="font-bold text-indigo-950">
                            {children}
                        </strong>
                    ),

                    em: ({ children }) => (
                        <em className="italic text-gray-700">
                            {children}
                        </em>
                    ),

                    ul: ({ children }) => (
                        <ul className="mb-3 ml-5 list-disc space-y-2 text-sm leading-6 text-gray-700 marker:text-indigo-600">
                            {children}
                        </ul>
                    ),

                    ol: ({ children }) => (
                        <ol className="mb-3 ml-5 list-decimal space-y-2 text-sm leading-6 text-gray-700 marker:font-bold marker:text-indigo-700">
                            {children}
                        </ol>
                    ),

                    li: ({ children }) => (
                        <li className="pl-1">{children}</li>
                    ),

                    blockquote: ({ children }) => (
                        <blockquote className="my-3 rounded-r-lg border-l-4 border-indigo-500 bg-indigo-50 px-3 py-3 text-sm text-gray-700">
                            {children}
                        </blockquote>
                    ),

                    a: ({ children, href }) => {
                        let lienValide = false;

                        try {
                            if (href) {
                                const url = new URL(href);

                                lienValide =
                                    url.protocol === "https:" ||
                                    url.protocol === "http:";
                            }
                        } catch {
                            lienValide = false;
                        }

                        return (
                            <a
                                href={
                                    lienValide ? href : undefined
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
                            >
                                {children}
                            </a>
                        );
                    },

                    pre: ({ children }) => (
                        <pre className="my-3 overflow-x-auto rounded-xl bg-gray-950 p-4 text-xs leading-6 text-green-300">
                            {children}
                        </pre>
                    ),

                    code: ({ children, className }) => {
                        const isBlocCode = Boolean(className);

                        return (
                            <code
                                className={
                                    isBlocCode
                                        ? className
                                        : "rounded-md bg-indigo-50 px-1.5 py-0.5 font-mono text-xs text-indigo-800"
                                }
                            >
                                {children}
                            </code>
                        );
                    },

                    table: ({ children }) => (
                        <div className="my-3 overflow-x-auto rounded-xl border border-gray-200">
                            <table className="w-full border-collapse text-left text-xs">
                                {children}
                            </table>
                        </div>
                    ),

                    thead: ({ children }) => (
                        <thead className="bg-indigo-50 text-indigo-900">
                            {children}
                        </thead>
                    ),

                    th: ({ children }) => (
                        <th className="border border-indigo-100 px-3 py-2 font-bold">
                            {children}
                        </th>
                    ),

                    td: ({ children }) => (
                        <td className="border border-gray-200 px-3 py-2 text-gray-700">
                            {children}
                        </td>
                    ),

                    hr: () => (
                        <hr className="my-4 border-gray-200" />
                    ),
                }}
            >
                {contenu}
            </ReactMarkdown>
        );
    }

    // ===================================================
    // 11. AFFICHAGE DES SOURCES
    // ===================================================

    function afficherSources(message: Message) {
        if (
            message.role !== "assistant" ||
            !message.sources ||
            message.sources.length === 0
        ) {
            return null;
        }

        return (
            <div className="mt-4 border-t border-gray-100 pt-3">
                <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>

                    <span className="text-xs font-bold text-gray-700">
                        Sources consultées sur Internet
                    </span>
                </div>

                <div className="space-y-2">
                    {message.sources.map((source, index) => (
                        <a
                            key={`${source.url}-${index}`}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs text-indigo-700 transition hover:border-indigo-300 hover:bg-indigo-50"
                        >
                            <span className="font-bold">
                                {index + 1}.
                            </span>

                            <span className="min-w-0 flex-1 break-words font-medium underline underline-offset-2">
                                {source.titre || "Source Internet"}
                            </span>

                            <span className="shrink-0">↗</span>
                        </a>
                    ))}
                </div>
            </div>
        );
    }

    // ===================================================
    // 12. INTERFACE SAMA AI
    // ===================================================

    const afficherAccueil =
        messages.length === 1 &&
        messages[0].role === "assistant";

    return (
        <>
            {/* =========================================
                BOUTON FLOTTANT SAMA AI
            ========================================= */}

            <button
                onClick={() => {
                    chargerProfil();
                    setOpen(!open);
                }}
                aria-label="Ouvrir Sama AI"
                aria-expanded={open}
                className="fixed bottom-5 right-5 z-[100] flex items-center gap-3 rounded-full bg-gradient-to-r from-indigo-700 via-indigo-700 to-violet-700 px-5 py-3.5 text-white shadow-[0_8px_30px_rgba(79,70,229,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_35px_rgba(79,70,229,0.45)]"
            >
                <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/15">
                    <svg
                        width="23"
                        height="23"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    >
                        <rect
                            x="3"
                            y="7"
                            width="18"
                            height="13"
                            rx="3"
                        />
                        <path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" />
                        <path d="M2 12h1M21 12h1" />
                    </svg>

                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-indigo-700 bg-green-400" />
                </div>

                <span className="text-sm font-bold tracking-wide">
                    Sama AI
                </span>

                <span className="text-lg">
                    {open ? "×" : "✦"}
                </span>
            </button>

            {/* =========================================
                FENÊTRE DE DISCUSSION
            ========================================= */}

            {open && (
                <div className="fixed bottom-24 right-4 z-[99] flex h-[min(690px,calc(100dvh-125px))] w-[min(430px,calc(100vw-24px))] flex-col overflow-hidden rounded-[26px] border border-gray-200 bg-white shadow-[0_20px_70px_rgba(15,23,42,0.20)] sm:right-6">

                    {/* =================================
                        EN-TÊTE
                    ================================= */}

                    <div className="relative overflow-hidden bg-gradient-to-br from-indigo-800 via-indigo-700 to-violet-700 px-5 py-5 text-white">

                        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full border-[25px] border-white/5" />

                        <div className="pointer-events-none absolute -bottom-20 right-20 h-40 w-40 rounded-full bg-violet-400/10 blur-2xl" />

                        <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">

                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-inner">
                                    <svg
                                        width="27"
                                        height="27"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.8"
                                    >
                                        <rect
                                            x="3"
                                            y="7"
                                            width="18"
                                            height="13"
                                            rx="3"
                                        />
                                        <path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" />
                                    </svg>
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold tracking-wide">
                                        Sama AI
                                    </h2>

                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-green-400" />

                                        <p className="text-xs text-indigo-100">
                                            Assistant intelligent
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setOpen(false)}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/20"
                                aria-label="Fermer Sama AI"
                            >
                                ×
                            </button>
                        </div>

                        <div className="relative mt-4 flex items-center gap-2">
                            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold tracking-wider text-indigo-50">
                                ORIENTATIONSN
                            </span>

                            <span className="text-[10px] text-indigo-200">
                                Ton avenir commence ici.
                            </span>
                        </div>
                    </div>

                    {/* =================================
                        PROFIL DE L'ÉTUDIANT
                    ================================= */}

                    {profil ? (
                        <div className="border-b border-indigo-100 bg-indigo-50/70 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                                    <svg
                                        width="15"
                                        height="15"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="12" cy="8" r="4" />
                                        <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
                                    </svg>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-indigo-900">
                                        Profil étudiant connecté
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] text-indigo-700">
                                        Série {profil.serie}
                                        {" • "}
                                        Moyenne : {profil.moyenneBac}/20
                                        {" • "}
                                        {profil.mention}
                                    </p>
                                </div>

                                <span className="rounded-full bg-green-100 px-2 py-1 text-[9px] font-bold text-green-700">
                                    ACTIF
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="border-b border-gray-100 bg-gray-50 px-5 py-3">
                            <div className="flex items-center gap-2">
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    className="shrink-0 text-gray-400"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 11v5M12 7h.01" />
                                </svg>

                                <p className="text-[11px] leading-5 text-gray-500">
                                    Aucun profil enregistré. Tu peux faire le test d'orientation sur OrientationSN.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* =================================
                        ZONE DES MESSAGES
                    ================================= */}

                    <div
                        ref={zoneMessagesRef}
                        className="flex-1 space-y-5 overflow-y-auto bg-[#f8f9fd] px-4 py-5 sm:px-5"
                    >

                        {/* ACCUEIL PERSONNALISÉ */}

                        {afficherAccueil && (
                            <div className="space-y-5">

                                <div className="pt-2 text-center">

                                    <div className="mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[23px] bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200">
                                        <svg
                                            width="34"
                                            height="34"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.6"
                                        >
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83m8.48 8.48 2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48 2.83-2.83" />
                                            <circle cx="12" cy="12" r="4" />
                                        </svg>
                                    </div>

                                    <h3 className="mt-5 text-xl font-extrabold tracking-tight text-gray-900">
                                        Bonjour ! Bienvenue.
                                    </h3>

                                    <p className="mx-auto mt-2 max-w-[290px] text-sm leading-6 text-gray-500">
                                        Je suis <strong className="text-indigo-700">Sama AI</strong>, ton assistant d'orientation. Je t'accompagne pour construire ton avenir académique et professionnel.
                                    </p>

                                    <div className="mt-4 flex justify-center">
                                        <span className="rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-[10px] font-semibold text-indigo-600 shadow-sm">
                                            ✦ Pose-moi tes questions
                                        </span>
                                    </div>
                                </div>

                                {/* CARTES DE SUGGESTIONS */}

                                <div>
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="text-xs font-bold text-gray-800">
                                            Comment puis-je t'aider ?
                                        </h4>

                                        <span className="text-[10px] text-gray-400">
                                            Suggestions
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2.5">
                                        {SUGGESTIONS.map((suggestion) => (
                                            <button
                                                key={suggestion.titre}
                                                type="button"
                                                onClick={() =>
                                                    utiliserSuggestion(
                                                        suggestion.question
                                                    )
                                                }
                                                className="group rounded-2xl border border-gray-200 bg-white p-3 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                                            >
                                                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition group-hover:bg-indigo-100">
                                                    {afficherIcone(
                                                        suggestion.icon
                                                    )}
                                                </div>

                                                <p className="text-[11px] font-bold text-gray-800">
                                                    {suggestion.titre}
                                                </p>

                                                <p className="mt-1 text-[10px] leading-4 text-gray-500">
                                                    {suggestion.description}
                                                </p>

                                                <div className="mt-2 text-xs font-bold text-indigo-600">
                                                    Découvrir →
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* CONSEIL */}

                                <div className="rounded-2xl border border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 p-3.5">
                                    <div className="flex items-start gap-2.5">
                                        <span className="text-lg">
                                            💡
                                        </span>

                                        <div>
                                            <p className="text-[11px] font-bold text-amber-900">
                                                Un conseil
                                            </p>

                                            <p className="mt-1 text-[10px] leading-5 text-amber-800">
                                                Plus tu donnes de détails sur ton parcours et tes objectifs, plus mes conseils peuvent être pertinents.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* HISTORIQUE DES MESSAGES */}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`flex items-end gap-2 ${message.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                    }`}
                            >

                                {message.role === "assistant" && (
                                    <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-sm">
                                        <svg
                                            width="15"
                                            height="15"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                        >
                                            <rect
                                                x="3"
                                                y="7"
                                                width="18"
                                                height="13"
                                                rx="3"
                                            />
                                            <path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" />
                                        </svg>
                                    </div>
                                )}

                                <div
                                    className={`max-w-[88%] overflow-hidden rounded-2xl px-4 py-3 text-sm ${message.role === "user"
                                            ? "rounded-br-md bg-gradient-to-br from-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-100"
                                            : "rounded-bl-md border border-gray-100 bg-white text-gray-800 shadow-sm"
                                        }`}
                                >
                                    {message.role === "user" ? (
                                        <div className="whitespace-pre-wrap leading-6">
                                            {message.content}
                                        </div>
                                    ) : (
                                        <>
                                            {afficherReponse(
                                                message.content
                                            )}

                                            {message.rechercheGoogleEffectuee &&
                                                message.sources &&
                                                message.sources.length > 0 && (
                                                    <div className="mb-2 mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-semibold text-green-700">
                                                        <span>✓</span>
                                                        Informations complémentaires du Web
                                                    </div>
                                                )}

                                            {afficherSources(message)}
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* INDICATEUR DE CHARGEMENT */}

                        {loading && (
                            <div className="flex items-end gap-2">
                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                                    <span className="text-xs">✦</span>
                                </div>

                                <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600" />

                                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:150ms]" />

                                        <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-600 [animation-delay:300ms]" />

                                        <span className="ml-1 text-xs text-gray-500">
                                            Sama AI réfléchit...
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* =================================
                        ZONE DE SAISIE
                    ================================= */}

                    <div className="border-t border-gray-100 bg-white px-4 pb-4 pt-3">

                        <form
                            onSubmit={envoyerMessage}
                            className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-1.5 transition focus-within:border-indigo-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-50"
                        >
                            <input
                                value={question}
                                onChange={(e) =>
                                    setQuestion(e.target.value)
                                }
                                placeholder="Écris ta question ici..."
                                disabled={loading}
                                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-800 outline-none placeholder:text-gray-400 disabled:opacity-60"
                            />

                            <button
                                type="submit"
                                disabled={loading || !question.trim()}
                                aria-label="Envoyer le message"
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-violet-700 text-white shadow-md shadow-indigo-200 transition hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                            >
                                <svg
                                    width="19"
                                    height="19"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="m22 2-7 20-4-9-9-4Z" />
                                    <path d="M22 2 11 13" />
                                </svg>
                            </button>
                        </form>

                        <p className="mt-2 text-center text-[9px] text-gray-400">
                            Sama AI peut faire des erreurs. Vérifie les informations importantes.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}