
import type { ConfigurationSerie, SerieId } from "./types"

// -----------------------------------------------------------------------------
// ORIENTATION SN - DONNÉES COMMUNES
// -----------------------------------------------------------------------------
// Séries du baccalauréat et informations sur les concours.
// La série G est remplacée par STEG.
// -----------------------------------------------------------------------------

export const SERIES: ConfigurationSerie[] = [
    {
        id: "S1",
        label: "S1",
        description: "Sciences exactes - Mathématiques et Physique-Chimie",
        matieres: [
            { id: "mathematiques", label: "Mathématiques", obligatoire: true },
            { id: "physiqueChimie", label: "Physique-Chimie", obligatoire: true },
        ],
    },

    {
        id: "S2",
        label: "S2",
        description: "Sciences expérimentales - Mathématiques, Physique-Chimie et SVT",
        matieres: [
            { id: "mathematiques", label: "Mathématiques", obligatoire: true },
            { id: "physiqueChimie", label: "Physique-Chimie", obligatoire: true },
            { id: "svt", label: "SVT", obligatoire: true },
        ],
    },

    {
        id: "S3",
        label: "S3",
        description: "Sciences et techniques - Mathématiques, Physique-Chimie et Construction",
        matieres: [
            { id: "mathematiques", label: "Mathématiques", obligatoire: true },
            { id: "physiqueChimie", label: "Physique-Chimie", obligatoire: true },
            { id: "construction", label: "Construction", obligatoire: false },
        ],
    },

    {
        id: "L1",
        label: "L1",
        description: "Lettres - Langues et civilisations",
        matieres: [
            { id: "francais", label: "Français", obligatoire: true },
            { id: "philosophie", label: "Philosophie", obligatoire: true },
            { id: "anglais", label: "Anglais", obligatoire: true },
            { id: "histoireGeographie", label: "Histoire-Géographie", obligatoire: true },
        ],
    },

    {
        id: "L2",
        label: "L2",
        description: "Lettres - Sciences sociales et humaines",
        matieres: [
            { id: "francais", label: "Français", obligatoire: true },
            { id: "philosophie", label: "Philosophie", obligatoire: true },
            { id: "anglais", label: "Anglais", obligatoire: true },
            { id: "histoireGeographie", label: "Histoire-Géographie", obligatoire: true },
        ],
    },

    {
        id: "STEG",
        label: "STEG",
        description: "Sciences et Techniques de l'Économie et de la Gestion",
        matieres: [
            { id: "economie", label: "Économie", obligatoire: false },
            { id: "comptabilite", label: "Comptabilité", obligatoire: false },
            { id: "mathematiquesFinancieres", label: "Mathématiques financières", obligatoire: false },
            { id: "gestion", label: "Gestion", obligatoire: false },
        ],
    },

    {
        id: "T",
        label: "T",
        description: "Techniques industrielles - Mécanique et Électrotechnique",
        matieres: [
            { id: "mathematiques", label: "Mathématiques", obligatoire: true },
            { id: "physiqueChimie", label: "Physique-Chimie", obligatoire: true },
            { id: "mecanique", label: "Mécanique", obligatoire: false },
            { id: "electrotechnique", label: "Électrotechnique", obligatoire: false },
        ],
    },
]

// -----------------------------------------------------------------------------
// INFORMATIONS SUR LES CONCOURS
// -----------------------------------------------------------------------------

export const CONCOURS_INFO: Record<string, string> = {
    EPT: "École Polytechnique de Thiès",

    ESP: "École Supérieure Polytechnique de Dakar (UCAD)",

    IPSL: "Institut Polytechnique de Saint-Louis (UGB)",

    ISFAR: "Institut Supérieur de Formation Agricole et Rurale (Bambey)",

    ENSA: "École Nationale Supérieure d'Agriculture (Thiès)",

    ENSMG: "École Nationale Supérieure des Mines et de la Géologie",

    "Polytech Diamniadio": "Université Amadou Mahtar Mbow",

    CREM: "Concours de Recrutement des Élèves-Maîtres",

    FASTEF: "Faculté des Sciences et Technologies de l'Éducation et de la Formation",

    ENA: "École Nationale d'Administration",

    ESEA: "École Supérieure d'Économie Appliquée",

    "Ufr sciences de l'ingénieur": "Université Iba Der Thiam de Thiès",

    EMS: "École de Santé Militaire",
}

// -----------------------------------------------------------------------------
// RECHERCHE D'UNE SÉRIE
// -----------------------------------------------------------------------------

export function obtenirSerie(id: SerieId): ConfigurationSerie | undefined {
    return SERIES.find((serie) => serie.id === id)
}

// -----------------------------------------------------------------------------
// VÉRIFICATION DE L'IDENTIFIANT D'UNE SÉRIE
// -----------------------------------------------------------------------------

export function serieExiste(id: string): id is SerieId {
    return SERIES.some((serie) => serie.id === id)
}