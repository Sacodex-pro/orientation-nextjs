// -----------------------------------------------------------------------------
// ORIENTATION SN - TYPES PRINCIPAUX
// -----------------------------------------------------------------------------
// Ce fichier centralise les types TypeScript du test d'orientation post-bac.
// Il est utilisé par les différentes séries et le composant principal.
// -----------------------------------------------------------------------------

// Séries du baccalauréat prises en charge
// G est remplacée par STEG.
export type SerieId =
    | "S1"
    | "S2"
    | "S3"
    | "L1"
    | "L2"
    | "STEG"
    | "T"

// -----------------------------------------------------------------------------
// GROUPES DE RÉUSSITE
// -----------------------------------------------------------------------------

export type GroupeReussite =
    | "premier-tour"
    | "second-tour"
    | "non-admis"

// -----------------------------------------------------------------------------
// NIVEAUX D'ADMISSION
// -----------------------------------------------------------------------------

export type NiveauAdmission =
    | "excellent"
    | "tresBien"
    | "bien"
    | "assezBien"
    | "passable"
    | "rattrapages"
    | "nonAdmis"

// -----------------------------------------------------------------------------
// NOTES DU CANDIDAT
// -----------------------------------------------------------------------------

export type Notes = {
    mathematiques?: number
    physiqueChimie?: number
    svt?: number
    francais?: number
    philosophie?: number
    anglais?: number
    histoireGeographie?: number

    economie?: number
    comptabilite?: number
    mathematiquesFinancieres?: number
    gestion?: number

    construction?: number
    technologie?: number
    mecanique?: number
    electrotechnique?: number
}

// -----------------------------------------------------------------------------
// RÉSULTAT DU TEST
// -----------------------------------------------------------------------------

export type Resultat = {
    serie: SerieId

    niveau: NiveauAdmission

    groupe: GroupeReussite

    mention: string

    moyenne: number

    filieres: string[]

    concours: string[]

    notes?: Notes

    admis: boolean
}

// -----------------------------------------------------------------------------
// RÉSULTAT DU SECOND TOUR
// -----------------------------------------------------------------------------

export type ResultatSecondTour = {
    notes: number[]

    moyenneSecondTour: number

    moyenneFinale: number

    admis: boolean

    mention: string

    groupe: GroupeReussite
}

// -----------------------------------------------------------------------------
// STRUCTURE DES RECOMMANDATIONS
// -----------------------------------------------------------------------------

export type OrientationBase = {
    filieres: string[]

    concours: string[]
}

// -----------------------------------------------------------------------------
// CONFIGURATION DES MATIÈRES
// -----------------------------------------------------------------------------

export type Matiere = {
    id: keyof Notes

    label: string

    coefficient?: number

    obligatoire: boolean
}

// -----------------------------------------------------------------------------
// CONFIGURATION D'UNE SÉRIE
// -----------------------------------------------------------------------------

export type ConfigurationSerie = {
    id: SerieId

    label: string

    description: string

    matieres: Matiere[]
}