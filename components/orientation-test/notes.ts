
// -----------------------------------------------------------------------------
// ORIENTATION SN - VALIDATION DES NOTES
// -----------------------------------------------------------------------------
// Toutes les notes doivent être comprises entre 0 et 20.
// Aucune valeur incorrecte ne doit être transformée automatiquement.
// -----------------------------------------------------------------------------

export type ValidationNote = {
    valide: boolean
    valeur: number | null
    erreur: string | null
}

// -----------------------------------------------------------------------------
// NORMALISATION D'UNE NOTE
// -----------------------------------------------------------------------------
// Accepte la virgule ou le point comme séparateur décimal.
// -----------------------------------------------------------------------------

export function normaliserNote(valeur: string): string {
    return valeur.trim().replace(",", ".")
}

// -----------------------------------------------------------------------------
// VALIDATION D'UNE NOTE
// -----------------------------------------------------------------------------

export function validerNote(valeur: string): ValidationNote {
    const saisie = normaliserNote(valeur)

    // Vérifier si le champ est vide.
    if (saisie === "") {
        return {
            valide: false,
            valeur: null,
            erreur: "Veuillez saisir une note.",
        }
    }

    // Vérifier le format numérique.
    if (!/^(?:\d+\.?\d*|\.\d+)$/.test(saisie)) {
        return {
            valide: false,
            valeur: null,
            erreur: "Veuillez saisir une note numérique valide.",
        }
    }

    const note = Number(saisie)

    // Vérifier les nombres non valides.
    if (!Number.isFinite(note)) {
        return {
            valide: false,
            valeur: null,
            erreur: "La note saisie est invalide.",
        }
    }

    // Refuser les notes négatives.
    if (note < 0) {
        return {
            valide: false,
            valeur: null,
            erreur: "Une note négative est interdite. Réessayez.",
        }
    }

    // Refuser les notes supérieures à 20.
    if (note > 20) {
        return {
            valide: false,
            valeur: null,
            erreur: "La note ne peut pas dépasser 20/20. Réessayez.",
        }
    }

    // Note valide.
    return {
        valide: true,
        valeur: note,
        erreur: null,
    }
}

// -----------------------------------------------------------------------------
// VALIDATION DE PLUSIEURS NOTES
// -----------------------------------------------------------------------------

export function validerToutesLesNotes(
    notes: Record<string, string>
): {
    valide: boolean
    erreurs: Record<string, string>
    valeurs: Record<string, number>
} {
    const erreurs: Record<string, string> = {}
    const valeurs: Record<string, number> = {}

    for (const [matiere, saisie] of Object.entries(notes)) {
        const resultat = validerNote(saisie)

        if (!resultat.valide || resultat.valeur === null) {
            erreurs[matiere] = resultat.erreur ?? "Note invalide."
        } else {
            valeurs[matiere] = resultat.valeur
        }
    }

    return {
        valide: Object.keys(erreurs).length === 0,
        erreurs,
        valeurs,
    }
}

// -----------------------------------------------------------------------------
// VÉRIFICATION D'UNE LISTE DE NOTES
// -----------------------------------------------------------------------------

export function toutesLesNotesSontValides(
    notes: string[]
): boolean {
    if (notes.length === 0) {
        return false
    }

    return notes.every((note) => validerNote(note).valide)
}

// -----------------------------------------------------------------------------
// CALCUL D'UNE MOYENNE
// -----------------------------------------------------------------------------
// La moyenne n'est calculée que si toutes les notes sont valides.
// -----------------------------------------------------------------------------

export function calculerMoyenne(notes: number[]): number | null {
    if (notes.length === 0) {
        return null
    }

    if (
        !notes.every(
            (note) =>
                Number.isFinite(note) &&
                note >= 0 &&
                note <= 20
        )
    ) {
        return null
    }

    const somme = notes.reduce((total, note) => total + note, 0)

    return somme / notes.length
}

// -----------------------------------------------------------------------------
// ÉVALUATION DU NIVEAU DU CANDIDAT
// -----------------------------------------------------------------------------

export type NiveauResultat =
    | "excellent"
    | "tresBien"
    | "bien"
    | "assezBien"
    | "passable"
    | "rattrapages"
    | "nonAdmis"

export function evaluerNiveau(moyenne: number): {
    niveau: NiveauResultat
    mention: string
} {
    if (!Number.isFinite(moyenne) || moyenne < 0 || moyenne > 20) {
        throw new Error("Moyenne invalide : elle doit être comprise entre 0 et 20.")
    }

    if (moyenne >= 18) {
        return { niveau: "excellent", mention: "Excellent" }
    }

    if (moyenne >= 16) {
        return { niveau: "tresBien", mention: "Très Bien" }
    }

    if (moyenne >= 14) {
        return { niveau: "bien", mention: "Bien" }
    }

    if (moyenne >= 12) {
        return { niveau: "assezBien", mention: "Assez Bien" }
    }

    if (moyenne >= 10) {
        return { niveau: "passable", mention: "Passable" }
    }

    if (moyenne >= 8) {
        return {
            niveau: "rattrapages",
            mention: "Admissible au second groupe",
        }
    }

    return {
        niveau: "nonAdmis",
        mention: "Non admis",
    }
}