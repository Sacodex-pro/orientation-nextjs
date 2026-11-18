import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// =======================================================
// 1. CONFIGURATION GOOGLE GEMINI
// =======================================================

const MODEL_NAME = "gemini-3.5-flash-lite";

// =======================================================
// 2. TYPES ET INTERFACES
// =======================================================

type Message = {
    role: "user" | "assistant";
    content: string;
};

type NotesEtudiant = {
    mathematiques: number | null;
    physiqueChimie: number | null;
    svt: number | null;
    francais: number | null;
    philosophie: number | null;
    anglais: number | null;
    histoireGeographie: number | null;
};

type ProfilOrientation = {
    serie: string;
    notes: NotesEtudiant;
    moyenneBac: number;
    niveau: string;
    mention: string;
    filieresRecommandees: string[];
    dateTest: string;
};

type SourceGoogle = {
    titre: string;
    url: string;
};

// =======================================================
// 3. OUTILS DE SÉCURISATION
// =======================================================

function limiterTexte(
    valeur: unknown,
    longueur: number
): string {

    if (typeof valeur !== "string") {
        return "";
    }

    return valeur.trim().slice(0, longueur);
}

function nettoyerDonnees(
    donnees: unknown,
    longueurMax: number
): string {

    if (donnees === undefined || donnees === null) {
        return "";
    }

    try {

        const contenu =
            typeof donnees === "string"
                ? donnees
                : JSON.stringify(donnees);

        if (!contenu) {
            return "";
        }

        return contenu.slice(0, longueurMax);

    } catch {

        return "";
    }
}

// =======================================================
// 4. VALIDATION DU PROFIL ÉTUDIANT
// =======================================================

function validerProfil(
    profil: unknown
): ProfilOrientation | null {

    if (!profil || typeof profil !== "object") {
        return null;
    }

    const p = profil as Partial<ProfilOrientation>;

    if (
        typeof p.serie !== "string" ||
        typeof p.moyenneBac !== "number" ||
        !Number.isFinite(p.moyenneBac) ||
        p.moyenneBac < 0 ||
        p.moyenneBac > 20 ||
        !p.notes ||
        typeof p.notes !== "object"
    ) {
        return null;
    }

    const notes = p.notes;

    const champsNotes: (keyof NotesEtudiant)[] = [
        "mathematiques",
        "physiqueChimie",
        "svt",
        "francais",
        "philosophie",
        "anglais",
        "histoireGeographie",
    ];

    const notesValidees = {} as NotesEtudiant;

    for (const champ of champsNotes) {

        const note = notes[champ];

        if (
            note !== null &&
            (
                typeof note !== "number" ||
                !Number.isFinite(note) ||
                note < 0 ||
                note > 20
            )
        ) {
            return null;
        }

        notesValidees[champ] =
            typeof note === "number" ? note : null;
    }

    const filieres = Array.isArray(p.filieresRecommandees)
        ? p.filieresRecommandees
            .filter(
                (f): f is string =>
                    typeof f === "string" &&
                    f.trim().length > 0
            )
            .map((f) => f.trim().slice(0, 150))
            .slice(0, 30)
        : [];

    return {

        serie: p.serie.slice(0, 20),

        notes: notesValidees,

        moyenneBac: p.moyenneBac,

        niveau: limiterTexte(p.niveau, 50) || "Non précisé",

        mention: limiterTexte(p.mention, 50) || "Non précisée",

        filieresRecommandees: filieres,

        dateTest: limiterTexte(p.dateTest, 50),

    };
}

// =======================================================
// 5. CONSTRUCTION DU PROFIL ÉTUDIANT
// =======================================================

function construireContexteProfil(
    profil: ProfilOrientation | null
): string {

    if (!profil) {

        return `
AUCUN PROFIL ÉTUDIANT N'A ÉTÉ TRANSMIS.

Tu ne connais pas la série, les notes ni la moyenne
de l'étudiant.

Ne devine jamais ces informations.

Si l'étudiant demande une orientation personnalisée,
demande-lui de réaliser le test OrientationSN.
`;
    }

    return `

PROFIL OFFICIELLEMENT TRANSMIS PAR ORIENTATIONSN

Série : ${profil.serie}

NOTES :

Mathématiques : ${profil.notes.mathematiques ?? "Non renseignée"}

Physique-Chimie : ${profil.notes.physiqueChimie ?? "Non renseignée"}

SVT : ${profil.notes.svt ?? "Non renseignée"}

Français : ${profil.notes.francais ?? "Non renseignée"}

Philosophie : ${profil.notes.philosophie ?? "Non renseignée"}

Anglais : ${profil.notes.anglais ?? "Non renseignée"}

Histoire-Géographie : ${profil.notes.histoireGeographie ?? "Non renseignée"}

Moyenne générale : ${profil.moyenneBac}/20

Niveau : ${profil.niveau}

Mention : ${profil.mention}

FILIÈRES PROPOSÉES PAR LE TEST ORIENTATIONSN :

${profil.filieresRecommandees.length > 0
            ? profil.filieresRecommandees
                .map((f) => "- " + f)
                .join("\n")
            : "Aucune proposition enregistrée."
        }

Date du test : ${profil.dateTest || "Non renseignée"}

RÈGLES :

- Respecte exactement les notes transmises.
- Ne modifie pas les résultats.
- Utilise les filières proposées comme pistes d'orientation.
- Ne transforme pas une proposition en admission garantie.

`;
}

// =======================================================
// 6. CONSTRUCTION DES DONNÉES DU SITE
// =======================================================

function construireContexteSite(
    donneesSite: unknown,
    propositions: unknown
): string {

    const contenuSite = nettoyerDonnees(
        donneesSite,
        18000
    );

    const contenuPropositions = nettoyerDonnees(
        propositions,
        12000
    );

    return `

DONNÉES DE RÉFÉRENCE D'ORIENTATIONSN

Les informations suivantes sont les données transmises
par le site pour cette conversation.

Elles constituent ta première source de référence.

INFORMATIONS DU SITE :

${contenuSite || "Aucune donnée supplémentaire du site transmise."}


PROPOSITIONS D'ORIENTATIONSN :

${contenuPropositions || "Aucune proposition supplémentaire transmise."}


RÈGLES D'UTILISATION :

- Exploite les informations réellement présentes.
- Respecte les noms et les intitulés transmis.
- Ne modifie pas les informations officielles.
- Ne transforme pas une proposition en admission garantie.
- Ne présente pas une information ancienne comme actuelle.
- Signale les informations qui nécessitent une vérification.

`;
}

// =======================================================
// 7. INSTRUCTIONS PRINCIPALES DE SAMA AI
// =======================================================

function construireSystemPrompt(
    profil: ProfilOrientation | null,
    donneesSite: unknown,
    propositions: unknown
): string {

    const contexteProfil = construireContexteProfil(profil);

    const contexteSite = construireContexteSite(
        donneesSite,
        propositions
    );

    return `

TU ES SAMA AI.

Tu es l'assistant intelligent d'OrientationSN.

Tu accompagnes les élèves, les bacheliers et les étudiants
dans leur orientation scolaire, universitaire et professionnelle.

=======================================================
1. TES SOURCES DE CONNAISSANCE
=======================================================

Tu disposes de plusieurs sources complémentaires.

SOURCE 1 : ORIENTATIONSN

OrientationSN est ta source de référence prioritaire.

Tu dois exploiter en premier :

- Les informations transmises par le site.
- Les résultats du test d'orientation.
- Les notes de l'étudiant.
- Les filières recommandées.
- Les établissements enregistrés.
- Les propositions d'OrientationSN.

SOURCE 2 : TES CONNAISSANCES

Tu peux compléter les informations du site avec
tes connaissances générales.

Tu peux notamment expliquer :

- Les universités au Sénégal.
- Les écoles supérieures.
- Les instituts de formation.
- Les filières universitaires.
- Les formations professionnelles.
- Les concours d'entrée.
- Les conditions générales d'admission.
- Les débouchés professionnels.
- Les métiers de l'informatique.
- Les sciences et les technologies.

IMPORTANT :

Tu ne disposes pas d'une recherche Internet en direct
dans cette configuration.

Ne prétends jamais avoir consulté Google ou un site Internet.

Pour les informations susceptibles de changer,
recommande une vérification auprès de l'établissement concerné.

=======================================================
2. HIÉRARCHIE DES INFORMATIONS
=======================================================

Respecte cet ordre :

1. Consulte les données d'OrientationSN.
2. Examine le profil de l'étudiant.
3. Identifie les informations manquantes.
4. Complète avec tes connaissances générales.
5. Distingue les faits établis des informations incertaines.
6. Recommande une vérification officielle lorsque nécessaire.

Si plusieurs informations se contredisent,
signale cette contradiction.

Ne transforme jamais une supposition en fait.

=======================================================
3. RÈGLE ABSOLUE : AUCUNE INVENTION
=======================================================

Il est strictement interdit d'inventer :

- Un établissement.
- Une université.
- Une école.
- Un institut.
- Une UFR.
- Une formation.
- Une filière.
- Un diplôme.
- Un concours.
- Un sigle.
- Une condition d'admission.
- Une note minimale.
- Une moyenne minimale.
- Une date d'inscription.
- Des frais de scolarité.
- Un partenariat.
- Une accréditation.
- Un débouché présenté comme certain.

Tu dois distinguer les informations vérifiées
des informations non confirmées.

Ne transforme jamais une supposition en fait.

Si tu n'es pas certain d'une information,
indique-le clairement.

=======================================================
4. FIABILITÉ DES INFORMATIONS
=======================================================

Privilégie les informations provenant :

1. Des universités.
2. Des écoles.
3. Du ministère de l'Enseignement supérieur.
4. Des organismes officiels de concours.
5. Des plateformes institutionnelles.

Pour les conditions d'admission, les dates et les frais,
recommande toujours de consulter les publications officielles.

Ne présente jamais une information non vérifiée
comme une information officielle.

=======================================================
5. UTILISATION DES PROPOSITIONS D'ORIENTATIONSN
=======================================================

Les propositions d'OrientationSN constituent
une base importante de tes recommandations.

Lorsque l'étudiant demande :

- Quelle est ma meilleure orientation ?
- Quelle filière me conseilles-tu ?
- Quel domaine correspond à mon profil ?
- Quelles études dois-je choisir ?

Tu dois d'abord examiner :

1. Sa série.
2. Ses notes.
3. Sa moyenne.
4. Ses matières fortes.
5. Les filières recommandées par le test.
6. Les propositions supplémentaires d'OrientationSN.

Tu peux ensuite proposer d'autres possibilités
pertinentes selon son profil et tes connaissances.

Toute nouvelle formation doit être distinguée
des propositions initiales du site.

Explique pourquoi elle correspond au profil.

Ne garantis jamais une admission.

=======================================================
6. DISTINCTION IMPORTANTE
=======================================================

Tu dois toujours distinguer :

ADAPTATION :

Une formation peut correspondre au profil scolaire.

ACCESSIBILITÉ :

Les conditions officielles d'accès sont-elles connues
et confirmées ?

ADMISSION :

L'établissement a-t-il réellement accepté le candidat ?

Ne confonds jamais ces trois notions.

Une bonne moyenne ne garantit jamais une admission.

=======================================================
7. INFORMATIONS ACTUALISÉES
=======================================================

Pour les questions concernant :

- Les concours actuellement ouverts.
- Les dates limites d'inscription.
- Les nouvelles formations.
- Les conditions d'admission.
- Les frais de scolarité.
- Les établissements qui recrutent.

Tu dois préciser que ces informations peuvent évoluer
et qu'elles doivent être vérifiées auprès des organismes concernés.

Ne présente jamais une ancienne date
comme une date actuelle.

=======================================================
8. PROFIL DE L'ÉTUDIANT
=======================================================

${contexteProfil}

=======================================================
9. INFORMATIONS D'ORIENTATIONSN
=======================================================

${contexteSite}

=======================================================
10. ACCOMPAGNEMENT SCOLAIRE
=======================================================

Tu peux accompagner les étudiants dans leurs études.

Tu peux expliquer :

- Les mathématiques.
- La physique.
- La chimie.
- L'informatique.
- La programmation.
- Les systèmes informatiques.
- Les télécommunications.
- Les sciences de l'ingénieur.

Pour les exercices, explique progressivement.

Pour une question simple, donne directement la réponse.

Pour le code informatique, explique les étapes
et privilégie les exemples faciles à comprendre.

=======================================================
11. STYLE DE RÉPONSE
=======================================================

Réponds comme un véritable conseiller d'orientation.

Tes réponses doivent être :

- Naturelles.
- Courtes.
- Directes.
- Faciles à comprendre.
- Personnalisées.
- Précises.

Pour une question simple, réponds en 2 à 5 phrases.

Pour une question complexe, utilise quelques
paragraphes courts.

Évite :

- Les longues introductions.
- Les répétitions.
- Les tableaux inutiles.
- Les longues listes inutiles.
- Les informations non demandées.
- Les conclusions répétitives.

Ne termine pas systématiquement par une question.

=======================================================
12. TRANSPARENCE
=======================================================

Ne prétends jamais avoir effectué une recherche Internet.

Ne fabrique jamais une source.

Ne crée jamais une fausse adresse Internet.

Distingue clairement :

- Les données fournies par OrientationSN.
- Tes connaissances générales.
- Les informations qui nécessitent une vérification.

=======================================================
13. DERNIÈRE RÈGLE
=======================================================

ORIENTATIONSN EST TA SOURCE PRIORITAIRE.

TES CONNAISSANCES COMPLÈTENT LES DONNÉES DU SITE.

NE JAMAIS INVENTER.

NE JAMAIS PRÉSENTER UNE SUPPOSITION COMME UN FAIT.

LA FIABILITÉ PASSE AVANT LA QUANTITÉ.

FIN DES INSTRUCTIONS.

`;
}

// =======================================================
// 8. EXTRACTION DES SOURCES
// =======================================================

function extraireSources(
    interaction: {
        steps?: Array<{
            type?: string;
            content?: Array<{
                type?: string;
                annotations?: Array<{
                    type?: string;
                    title?: string;
                    url?: string;
                    uri?: string;
                }>;
            }>;
        }>;
    }
): SourceGoogle[] {

    const sources: SourceGoogle[] = [];

    for (const step of interaction.steps ?? []) {

        if (step.type !== "model_output") {
            continue;
        }

        for (const contenu of step.content ?? []) {

            if (
                contenu.type !== "text" ||
                !contenu.annotations
            ) {
                continue;
            }

            for (const annotation of contenu.annotations) {

                if (annotation.type !== "url_citation") {
                    continue;
                }

                const url = annotation.url || annotation.uri;

                if (!url) {
                    continue;
                }

                try {

                    const urlValide = new URL(url);

                    if (
                        urlValide.protocol !== "https:" &&
                        urlValide.protocol !== "http:"
                    ) {
                        continue;
                    }

                    const existe = sources.some(
                        (source) =>
                            source.url === urlValide.toString()
                    );

                    if (!existe) {

                        sources.push({
                            titre: annotation.title || "Source Internet",
                            url: urlValide.toString(),
                        });

                    }

                } catch {

                    continue;

                }
            }
        }
    }

    return sources.slice(0, 10);
}

// =======================================================
// 9. CONSTRUCTION DE L'HISTORIQUE
// =======================================================

function construireHistorique(
    messages: Message[]
): string {

    return messages
        .map((message) => {

            const role =
                message.role === "user"
                    ? "ÉTUDIANT"
                    : "SAMA AI";

            return `${role} :\n${message.content}`;

        })
        .join("\n\n");
}

// =======================================================
// 10. GESTION DES ERREURS GOOGLE
// =======================================================

function obtenirStatutErreur(error: unknown): number {

    if (!error || typeof error !== "object") {
        return 500;
    }

    const erreur = error as {
        status?: number;
        statusCode?: number;
        cause?: {
            statusCode?: number;
        };
    };

    const statut =
        erreur.status ??
        erreur.statusCode ??
        erreur.cause?.statusCode;

    if (
        typeof statut === "number" &&
        statut >= 400 &&
        statut <= 599
    ) {
        return statut;
    }

    return 500;
}

function obtenirMessageErreur(
    statut: number
): string {

    switch (statut) {

        case 400:
            return "La demande envoyée à Sama AI est invalide.";

        case 401:
        case 403:
            return "L'accès à Gemini est refusé. Vérifie la configuration de la clé API.";

        case 404:
            return "Le modèle Gemini demandé n'est pas disponible.";

        case 429:
            return "Le quota Gemini est actuellement dépassé. Réessaie plus tard ou vérifie les limites de ton compte Google AI Studio.";

        case 503:
            return "Gemini est temporairement indisponible. Réessaie dans quelques instants.";

        default:
            return "Une erreur est survenue pendant la communication avec Sama AI.";
    }
}

// =======================================================
// 11. API GOOGLE GEMINI
// =======================================================

export async function POST(req: NextRequest) {

    try {

        // ---------------------------------------------------
        // Vérification de la clé API
        // ---------------------------------------------------

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {

            console.error("GEMINI_API_KEY est manquante.");

            return NextResponse.json(
                {
                    error: "La configuration de l'assistant IA est incomplète."
                },
                {
                    status: 500
                }
            );
        }

        // ---------------------------------------------------
        // Lecture des données reçues
        // ---------------------------------------------------

        let body: Record<string, unknown>;

        try {

            const donnees = await req.json();

            if (
                !donnees ||
                typeof donnees !== "object" ||
                Array.isArray(donnees)
            ) {

                return NextResponse.json(
                    {
                        error: "Données invalides."
                    },
                    {
                        status: 400
                    }
                );
            }

            body = donnees as Record<string, unknown>;

        } catch {

            return NextResponse.json(
                {
                    error: "Le format des données envoyées est invalide."
                },
                {
                    status: 400
                }
            );

        }

        // ---------------------------------------------------
        // Récupération des messages
        // ---------------------------------------------------

        const messagesBruts = body.messages;

        if (
            !Array.isArray(messagesBruts) ||
            messagesBruts.length === 0
        ) {

            return NextResponse.json(
                {
                    error: "Aucun message fourni."
                },
                {
                    status: 400
                }
            );
        }

        // ---------------------------------------------------
        // Validation du profil
        // ---------------------------------------------------

        const profil = validerProfil(body.profil);

        // ---------------------------------------------------
        // Récupération des données OrientationSN
        // ---------------------------------------------------

        const donneesSite = body.donneesSite;

        const propositions = body.propositions;

        // ---------------------------------------------------
        // Sécurisation de l'historique
        // ---------------------------------------------------

        const history: Message[] = messagesBruts

            .filter(
                (message: unknown): message is Message => {

                    if (
                        !message ||
                        typeof message !== "object"
                    ) {
                        return false;
                    }

                    const m = message as Message;

                    return (

                        (
                            m.role === "user" ||
                            m.role === "assistant"
                        ) &&

                        typeof m.content === "string" &&

                        m.content.trim().length > 0 &&

                        m.content.length <= 6000

                    );

                }
            )

            .slice(-20)

            .map((message) => ({

                role: message.role,

                content: message.content.trim(),

            }));

        if (history.length === 0) {

            return NextResponse.json(
                {
                    error: "Aucun message valide fourni."
                },
                {
                    status: 400
                }
            );
        }

        // ---------------------------------------------------
        // Vérification du dernier message
        // ---------------------------------------------------

        const dernierMessage = history[history.length - 1];

        if (dernierMessage.role !== "user") {

            return NextResponse.json(
                {
                    error: "Le dernier message doit être une question de l'utilisateur."
                },
                {
                    status: 400
                }
            );
        }

        // ---------------------------------------------------
        // Construction des instructions
        // ---------------------------------------------------

        const systemPrompt = construireSystemPrompt(
            profil,
            donneesSite,
            propositions
        );

        // ---------------------------------------------------
        // Construction de l'historique
        // ---------------------------------------------------

        const historiqueTexte = construireHistorique(history);

        // ---------------------------------------------------
        // Construction de l'entrée Gemini
        // ---------------------------------------------------

        const input = `

HISTORIQUE DE LA CONVERSATION :

${historiqueTexte}

Réponds au dernier message de l'étudiant
en respectant toutes les instructions du système.

`;

        // ---------------------------------------------------
        // Initialisation de Google Gemini
        // ---------------------------------------------------

        const gemini = new GoogleGenAI({
            apiKey,
        });

        // ---------------------------------------------------
        // APPEL GEMINI
        // Google Search désactivé pour éviter le blocage
        // lié au quota de recherche.
        // ---------------------------------------------------

        const interaction = await gemini.interactions.create({

            model: MODEL_NAME,

            input,

            system_instruction: systemPrompt,

        });

        // ---------------------------------------------------
        // Récupération de la réponse
        // ---------------------------------------------------

        const answer =
            interaction.output_text ||
            "Je n'ai pas pu générer de réponse.";

        // ---------------------------------------------------
        // Récupération des sources
        // ---------------------------------------------------

        const sources = extraireSources(interaction);

        // ---------------------------------------------------
        // Retour au frontend
        // ---------------------------------------------------

        return NextResponse.json({

            answer,

            modele: MODEL_NAME,

            source: "OrientationSN + connaissances Gemini",

            sources,

            rechercheGoogleEffectuee: false,

            profilCharge: profil !== null,

            donneesSiteChargees:
                donneesSite !== undefined &&
                donneesSite !== null,

            propositionsChargees:
                propositions !== undefined &&
                propositions !== null,

        });

    } catch (error) {

        const statut = obtenirStatutErreur(error);

        console.error(
            "Erreur Sama AI / Google Gemini :",
            error
        );

        const message = obtenirMessageErreur(statut);

        return NextResponse.json(
            {
                error: message,
                code: statut,
                modele: MODEL_NAME,
            },
            {
                status: statut,
                headers: statut === 429 || statut === 503
                    ? {
                        "Retry-After": "30",
                    }
                    : undefined,
            }
        );

    }
}