
"use client";

import { useMemo, useState } from "react";

/* =========================================================
   1. TYPES
========================================================= */

export type CategorieMatiere =
    | "dominante"
    | "non-dominante";

export type MatiereDeuxiemeGroupe = {
    id: string;
    nom: string;
    categorie: CategorieMatiere;

    // Coefficient officiel de la matière.
    coefficient: number;

    // Note obtenue au premier groupe.
    notePremierGroupe: number;
};

export type ConfigurationDeuxiemeGroupe = {
    serie: string;
    session: string;

    // Source permettant de vérifier les coefficients.
    sourceOfficielle: string;

    // Toutes les matières du candidat avec leurs coefficients.
    matieres: MatiereDeuxiemeGroupe[];
};

type PropsDeuxiemeGroupe = {
    configuration: ConfigurationDeuxiemeGroupe;

    moyennePremierGroupe: number;

    onTerminer?: (resultat: ResultatDeuxiemeGroupe) => void;
};

export type ResultatDeuxiemeGroupe = {
    serie: string;
    session: string;
    moyenneInitiale: number;
    nouvelleMoyenne: number;

    admis: boolean;

    verdict: string;
    mention: string;

    matieres: {
        nom: string;
        notePremierGroupe: number;
        noteDeuxiemeGroupe: number;
        meilleureNote: number;
        coefficient: number;
        absence: boolean;
    }[];
};

/* =========================================================
   2. FONCTIONS DE VALIDATION
========================================================= */

function noteEstValide(valeur: string): boolean {
    if (valeur.trim() === "") {
        return false;
    }

    const note = Number(valeur.replace(",", "."));

    return (
        Number.isFinite(note) &&
        note >= 0 &&
        note <= 20
    );
}

function formaterMoyenne(valeur: number): string {
    return valeur.toFixed(2).replace(".", ",");
}

/* =========================================================
   3. COMPOSANT PRINCIPAL
========================================================= */

export default function DeuxiemeGroupe({
    configuration,
    moyennePremierGroupe,
    onTerminer,
}: PropsDeuxiemeGroupe) {
    const [matiereDominante1, setMatiereDominante1] =
        useState("");

    const [matiereDominante2, setMatiereDominante2] =
        useState("");

    const [matiereNonDominante, setMatiereNonDominante] =
        useState("");

    const [notesDeuxiemeGroupe, setNotesDeuxiemeGroupe] =
        useState<Record<string, string>>({});

    const [absences, setAbsences] =
        useState<Record<string, boolean>>({});

    const [resultat, setResultat] =
        useState<ResultatDeuxiemeGroupe | null>(null);

    const [erreur, setErreur] = useState("");

    const matieresDominantes = useMemo(
        () =>
            configuration.matieres.filter(
                (matiere) => matiere.categorie === "dominante"
            ),
        [configuration.matieres]
    );

    const matieresNonDominantes = useMemo(
        () =>
            configuration.matieres.filter(
                (matiere) => matiere.categorie === "non-dominante"
            ),
        [configuration.matieres]
    );

    const matieresChoisies = useMemo(
        () =>
            [
                matiereDominante1,
                matiereDominante2,
                matiereNonDominante,
            ].filter(Boolean),
        [
            matiereDominante1,
            matiereDominante2,
            matiereNonDominante,
        ]
    );

    const troisMatieresChoisies =
        matieresChoisies.length === 3 &&
        new Set(matieresChoisies).size === 3;

    /* =======================================================
       4. VALIDATION DE LA CONFIGURATION OFFICIELLE
    ======================================================= */

    const configurationValide = useMemo(() => {
        if (!configuration.session.trim()) {
            return false;
        }

        if (!configuration.sourceOfficielle.trim()) {
            return false;
        }

        if (configuration.matieres.length === 0) {
            return false;
        }

        return configuration.matieres.every(
            (matiere) =>
                matiere.id.trim() !== "" &&
                matiere.nom.trim() !== "" &&
                Number.isFinite(matiere.coefficient) &&
                matiere.coefficient > 0 &&
                Number.isFinite(matiere.notePremierGroupe) &&
                matiere.notePremierGroupe >= 0 &&
                matiere.notePremierGroupe <= 20
        );
    }, [configuration]);

    /* =======================================================
       5. SAISIE DES NOTES
    ======================================================= */

    function modifierNote(
        id: string,
        valeur: string
    ) {
        setErreur("");
        setResultat(null);

        const valeurNormalisee = valeur.replace(",", ".");

        if (
            valeurNormalisee !== "" &&
            !/^\d*\.?\d*$/.test(valeurNormalisee)
        ) {
            return;
        }

        if (valeurNormalisee !== "") {
            const nombre = Number(valeurNormalisee);

            if (nombre > 20) {
                setErreur(
                    "Une note ne peut pas dépasser 20/20. Veuillez saisir une nouvelle note."
                );
                return;
            }
        }

        setNotesDeuxiemeGroupe((ancien) => ({
            ...ancien,
            [id]: valeurNormalisee,
        }));
    }

    function modifierAbsence(
        id: string,
        absent: boolean
    ) {
        setErreur("");
        setResultat(null);

        setAbsences((ancien) => ({
            ...ancien,
            [id]: absent,
        }));

        if (absent) {
            setNotesDeuxiemeGroupe((ancien) => ({
                ...ancien,
                [id]: "0",
            }));
        }
    }

    /* =======================================================
       6. CALCUL DE LA NOUVELLE MOYENNE
    ======================================================= */

    function calculerResultat() {
        setErreur("");
        setResultat(null);

        if (!configurationValide) {
            setErreur(
                "La configuration des coefficients officiels est incomplète. Le calcul est impossible."
            );
            return;
        }

        if (!Number.isFinite(moyennePremierGroupe) ||
            moyennePremierGroupe < 8 ||
            moyennePremierGroupe >= 10) {
            setErreur(
                "Le deuxième groupe est réservé aux candidats dont la moyenne du premier groupe est comprise entre 8/20 et moins de 10/20."
            );
            return;
        }

        if (!troisMatieresChoisies) {
            setErreur(
                "Choisissez deux matières dominantes différentes et une matière non dominante."
            );
            return;
        }

        const matieresDuDeuxiemeGroupe =
            configuration.matieres.filter((matiere) =>
                matieresChoisies.includes(matiere.id)
            );

        // Vérifier que les trois nouvelles notes sont saisies.
        for (const matiere of matieresDuDeuxiemeGroupe) {
            if (!absences[matiere.id]) {
                const valeur = notesDeuxiemeGroupe[matiere.id];

                if (
                    valeur === undefined ||
                    !noteEstValide(valeur)
                ) {
                    setErreur(
                        `Veuillez saisir une note valide entre 0 et 20 pour ${matiere.nom}.`
                    );
                    return;
                }
            }
        }

        // Recalcul sur toutes les matières de la série.
        let sommePonderee = 0;
        let sommeCoefficients = 0;

        const details: ResultatDeuxiemeGroupe["matieres"] = [];

        for (const matiere of configuration.matieres) {
            let meilleureNote = matiere.notePremierGroupe;

            let noteDeuxieme = matiere.notePremierGroupe;
            let absence = false;

            if (matieresChoisies.includes(matiere.id)) {
                absence = Boolean(absences[matiere.id]);

                noteDeuxieme = absence
                    ? 0
                    : Number(
                        notesDeuxiemeGroupe[matiere.id].replace(",", ".")
                    );

                // La meilleure note est conservée.
                meilleureNote = Math.max(
                    matiere.notePremierGroupe,
                    noteDeuxieme
                );
            }

            sommePonderee +=
                meilleureNote * matiere.coefficient;

            sommeCoefficients += matiere.coefficient;

            if (matieresChoisies.includes(matiere.id)) {
                details.push({
                    nom: matiere.nom,
                    notePremierGroupe: matiere.notePremierGroupe,
                    noteDeuxiemeGroupe: noteDeuxieme,
                    meilleureNote,
                    coefficient: matiere.coefficient,
                    absence,
                });
            }
        }

        if (sommeCoefficients <= 0) {
            setErreur(
                "Impossible de calculer la moyenne : coefficients invalides."
            );
            return;
        }

        const nouvelleMoyenne =
            sommePonderee / sommeCoefficients;

        const admis = nouvelleMoyenne >= 10;

        const nouveauResultat: ResultatDeuxiemeGroupe = {
            serie: configuration.serie,
            session: configuration.session,
            moyenneInitiale: moyennePremierGroupe,
            nouvelleMoyenne,
            admis,
            verdict: admis
                ? "Admis après le deuxième groupe"
                : "Non admis",
            mention: admis ? "Passable" : "Aucune mention",
            matieres: details,
        };

        setResultat(nouveauResultat);

        if (onTerminer) {
            onTerminer(nouveauResultat);
        }
    }

    /* =======================================================
       7. AFFICHAGE
    ======================================================= */

    return (
        <main className="min-h-screen bg-[#FAF6EE] px-4 py-10 text-[#1E2A3C]">

            <div className="mx-auto max-w-3xl">

                {/* EN-TÊTE */}

                <div className="mb-8">

                    <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[#C9622E]">
                        OrientationSN
                    </p>

                    <h1 className="text-3xl font-bold sm:text-4xl">
                        Deuxième groupe du Baccalauréat
                    </h1>

                    <p className="mt-3 leading-7 text-[#1E2A3C]/70">
                        Saisissez vos notes aux trois épreuves choisies.
                        OrientationSN conservera la meilleure note entre
                        le premier et le deuxième groupe, puis recalculera
                        votre moyenne générale.
                    </p>

                </div>

                {/* INFORMATIONS DU CANDIDAT */}

                <section className="mb-6 rounded-2xl border border-[#E7DFD0] bg-white p-5">

                    <h2 className="mb-4 text-lg font-bold">
                        Informations du candidat
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-3">

                        <div>
                            <p className="text-sm text-gray-500">Série</p>
                            <p className="font-bold">{configuration.serie}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Session</p>
                            <p className="font-bold">{configuration.session}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">
                                Moyenne initiale
                            </p>
                            <p className="text-xl font-bold text-[#C9622E]">
                                {formaterMoyenne(moyennePremierGroupe)}/20
                            </p>
                        </div>

                    </div>

                </section>

                {/* AVERTISSEMENT */}

                <section className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5">

                    <h2 className="mb-2 font-bold text-amber-900">
                        Attention : coefficients officiels
                    </h2>

                    <p className="text-sm leading-6 text-amber-900">
                        Les coefficients et la liste des matières doivent
                        correspondre à la série et à la session officielle.
                        Vérifiez ces informations auprès de l'Office du
                        baccalauréat avant tout calcul.
                    </p>

                    {configuration.sourceOfficielle && (
                        <p className="mt-3 break-words text-xs text-amber-800">
                            Source configurée : {configuration.sourceOfficielle}
                        </p>
                    )}

                </section>

                {!configurationValide && (
                    <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
                        La configuration officielle des matières et des
                        coefficients est absente ou invalide. Le calcul
                        est désactivé jusqu'à sa vérification.
                    </div>
                )}

                {/* CHOIX DES MATIÈRES */}

                <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">

                    <h2 className="mb-2 text-xl font-bold">
                        Choix des trois matières
                    </h2>

                    <p className="mb-6 text-sm text-gray-500">
                        Sélectionnez deux matières dominantes et une
                        matière non dominante.
                    </p>

                    {/* PREMIÈRE MATIÈRE DOMINANTE */}

                    <div className="mb-5">

                        <label className="mb-2 block font-semibold">
                            1. Première matière dominante
                        </label>

                        <select
                            value={matiereDominante1}
                            onChange={(e) => {
                                setMatiereDominante1(e.target.value);
                                setResultat(null);
                                setErreur("");
                            }}
                            className="w-full rounded-xl border border-[#E7DFD0] bg-white px-4 py-3 outline-none focus:border-[#C9622E]"
                        >

                            <option value="">
                                Choisir une matière
                            </option>

                            {matieresDominantes.map((matiere) => (
                                <option
                                    key={matiere.id}
                                    value={matiere.id}
                                    disabled={matiere.id === matiereDominante2}
                                >
                                    {matiere.nom}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* DEUXIÈME MATIÈRE DOMINANTE */}

                    <div className="mb-5">

                        <label className="mb-2 block font-semibold">
                            2. Deuxième matière dominante
                        </label>

                        <select
                            value={matiereDominante2}
                            onChange={(e) => {
                                setMatiereDominante2(e.target.value);
                                setResultat(null);
                                setErreur("");
                            }}
                            className="w-full rounded-xl border border-[#E7DFD0] bg-white px-4 py-3 outline-none focus:border-[#C9622E]"
                        >

                            <option value="">
                                Choisir une matière
                            </option>

                            {matieresDominantes.map((matiere) => (
                                <option
                                    key={matiere.id}
                                    value={matiere.id}
                                    disabled={matiere.id === matiereDominante1}
                                >
                                    {matiere.nom}
                                </option>
                            ))}

                        </select>

                    </div>

                    {/* MATIÈRE NON DOMINANTE */}

                    <div className="mb-5">

                        <label className="mb-2 block font-semibold">
                            3. Matière non dominante
                        </label>

                        <select
                            value={matiereNonDominante}
                            onChange={(e) => {
                                setMatiereNonDominante(e.target.value);
                                setResultat(null);
                                setErreur("");
                            }}
                            className="w-full rounded-xl border border-[#E7DFD0] bg-white px-4 py-3 outline-none focus:border-[#C9622E]"
                        >

                            <option value="">
                                Choisir une matière
                            </option>

                            {matieresNonDominantes.map((matiere) => (
                                <option
                                    key={matiere.id}
                                    value={matiere.id}
                                >
                                    {matiere.nom}
                                </option>
                            ))}

                        </select>

                    </div>

                </section>

                {/* SAISIE DES NOTES */}

                {troisMatieresChoisies && (

                    <section className="mb-6 rounded-2xl bg-white p-5 shadow-sm sm:p-7">

                        <h2 className="mb-2 text-xl font-bold">
                            Notes du deuxième groupe
                        </h2>

                        <p className="mb-6 text-sm text-gray-500">
                            Les notes du premier groupe sont conservées
                            automatiquement si elles sont meilleures.
                        </p>

                        {configuration.matieres
                            .filter((matiere) =>
                                matieresChoisies.includes(matiere.id)
                            )
                            .map((matiere) => {

                                const noteSaisie =
                                    notesDeuxiemeGroupe[matiere.id] ?? "";

                                const noteValideSaisie =
                                    absences[matiere.id]
                                        ? 0
                                        : Number(noteSaisie || 0);

                                const meilleureNote =
                                    noteSaisie !== "" || absences[matiere.id]
                                        ? Math.max(
                                            matiere.notePremierGroupe,
                                            noteValideSaisie
                                        )
                                        : matiere.notePremierGroupe;

                                return (

                                    <div
                                        key={matiere.id}
                                        className="mb-5 rounded-xl border border-[#E7DFD0] p-4 last:mb-0"
                                    >

                                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">

                                            <h3 className="font-bold">
                                                {matiere.nom}
                                            </h3>

                                            <span className="rounded-full bg-[#FAF6EE] px-3 py-1 text-xs font-semibold">
                                                Coefficient : {matiere.coefficient}
                                            </span>

                                        </div>

                                        <div className="mb-4 grid grid-cols-2 gap-3">

                                            <div className="rounded-lg bg-gray-50 p-3">

                                                <p className="text-xs text-gray-500">
                                                    Premier groupe
                                                </p>

                                                <p className="mt-1 text-xl font-bold">
                                                    {formaterMoyenne(
                                                        matiere.notePremierGroupe
                                                    )}
                                                    /20
                                                </p>

                                            </div>

                                            <div className="rounded-lg bg-[#FAF6EE] p-3">

                                                <p className="text-xs text-gray-500">
                                                    Meilleure note
                                                </p>

                                                <p className="mt-1 text-xl font-bold text-[#C9622E]">
                                                    {formaterMoyenne(meilleureNote)}
                                                    /20
                                                </p>

                                            </div>

                                        </div>

                                        <label className="mb-2 block text-sm font-semibold">
                                            Note du deuxième groupe
                                        </label>

                                        <input
                                            type="number"
                                            min="0"
                                            max="20"
                                            step="0.01"
                                            value={noteSaisie}
                                            disabled={Boolean(absences[matiere.id])}
                                            onChange={(e) =>
                                                modifierNote(
                                                    matiere.id,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Exemple : 13"
                                            className="w-full rounded-xl border border-[#E7DFD0] px-4 py-3 outline-none focus:border-[#C9622E] disabled:bg-gray-100"
                                        />

                                        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">

                                            <input
                                                type="checkbox"
                                                checked={Boolean(absences[matiere.id])}
                                                onChange={(e) =>
                                                    modifierAbsence(
                                                        matiere.id,
                                                        e.target.checked
                                                    )
                                                }
                                                className="h-4 w-4 accent-[#C9622E]"
                                            />

                                            Je suis absent à cette épreuve (00/20)

                                        </label>

                                    </div>

                                );
                            })}

                    </section>
                )}

                {/* ERREURS */}

                {erreur && (

                    <div
                        role="alert"
                        className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700"
                    >
                        {erreur}
                    </div>

                )}

                {/* CALCUL */}

                <button
                    type="button"
                    onClick={calculerResultat}
                    disabled={
                        !configurationValide ||
                        !troisMatieresChoisies
                    }
                    className="w-full rounded-xl bg-[#1E2A3C] px-6 py-4 font-bold text-white transition hover:bg-[#16233D] disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Calculer mon résultat
                </button>

                {/* RÉSULTAT FINAL */}

                {resultat && (

                    <section className="mt-8 rounded-2xl border border-[#E7DFD0] bg-white p-5 shadow-sm sm:p-7">

                        <h2 className="mb-5 text-2xl font-bold">
                            Résultat final
                        </h2>

                        <div className="mb-5 grid gap-4 sm:grid-cols-2">

                            <div className="rounded-xl bg-gray-50 p-4">

                                <p className="text-sm text-gray-500">
                                    Moyenne initiale
                                </p>

                                <p className="mt-2 text-2xl font-bold">
                                    {formaterMoyenne(
                                        resultat.moyenneInitiale
                                    )}
                                    /20
                                </p>

                            </div>

                            <div className="rounded-xl bg-[#FAF6EE] p-4">

                                <p className="text-sm text-gray-500">
                                    Nouvelle moyenne
                                </p>

                                <p className="mt-2 text-2xl font-bold text-[#C9622E]">
                                    {formaterMoyenne(
                                        resultat.nouvelleMoyenne
                                    )}
                                    /20
                                </p>

                            </div>

                        </div>

                        <h3 className="mb-3 font-bold">
                            Détail des trois matières
                        </h3>

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[550px] border-collapse text-sm">

                                <thead>

                                    <tr className="border-b border-gray-200 text-left">

                                        <th className="p-3">Matière</th>
                                        <th className="p-3">Premier groupe</th>
                                        <th className="p-3">Deuxième groupe</th>
                                        <th className="p-3">Note retenue</th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {resultat.matieres.map((matiere) => (

                                        <tr
                                            key={matiere.nom}
                                            className="border-b border-gray-100"
                                        >

                                            <td className="p-3 font-semibold">
                                                {matiere.nom}
                                            </td>

                                            <td className="p-3">
                                                {formaterMoyenne(
                                                    matiere.notePremierGroupe
                                                )}
                                            </td>

                                            <td className="p-3">
                                                {matiere.absence
                                                    ? "00 (Absent)"
                                                    : formaterMoyenne(
                                                        matiere.noteDeuxiemeGroupe
                                                    )}
                                            </td>

                                            <td className="p-3 font-bold text-[#C9622E]">
                                                {formaterMoyenne(
                                                    matiere.meilleureNote
                                                )}
                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                        <div
                            className={
                                "mt-6 rounded-xl p-5 text-center " +
                                (resultat.admis
                                    ? "bg-green-50 text-green-800"
                                    : "bg-red-50 text-red-800")
                            }
                        >

                            <p className="text-xl font-bold">
                                {resultat.verdict}
                            </p>

                            {resultat.admis && (

                                <p className="mt-2 font-semibold">
                                    Mention : {resultat.mention}
                                </p>

                            )}

                            <p className="mt-3 text-sm">
                                Moyenne finale :{" "}
                                {formaterMoyenne(
                                    resultat.nouvelleMoyenne
                                )}
                                /20
                            </p>

                        </div>

                        <p className="mt-5 text-xs leading-6 text-gray-500">
                            Ce résultat est une simulation calculée à partir
                            des notes et des coefficients configurés. Il ne
                            remplace pas les résultats officiels publiés par
                            l'Office du baccalauréat.
                        </p>

                    </section>

                )}

            </div>

        </main>
    );
}
