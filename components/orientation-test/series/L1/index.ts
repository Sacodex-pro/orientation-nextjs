
import type { OrientationBase } from "../../types";
import {
    ajouterListeSansDoublon,
    creerOrientationBase,
} from "../commun";

/**
 * Calcule les filières et concours recommandés
 * pour un candidat de la série L1.
 */
export function orienterL1(
    moyenneMatieresLitteraires: number,
    moyenneBac: number
): OrientationBase {
    const orientation = creerOrientationBase();

    // Très bon niveau littéraire.
    if (moyenneMatieresLitteraires >= 14) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Droit",
            "Sciences politiques",
            "Sciences juridiques",
            "Lettres modernes",
            "Histoire",
            "Géographie",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "CREM",
            "FASTEF",
        ]);
    }

    // Niveau littéraire satisfaisant.
    else if (moyenneMatieresLitteraires >= 10) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Histoire",
            "Philosophie",
            "Langues étrangères appliquées (LEA)",
            "Communication",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "CREM",
            "FASTEF",
            "Polytech Diamniadio",
        ]);
    }

    // Niveau littéraire inférieur à 10.
    else {
        ajouterListeSansDoublon(orientation.filieres, [
            "Administration économique et sociale (AES)",
            "Tourisme et hôtellerie",
            "FASEG",
        ]);
    }

    // Concours accessibles selon les recommandations générales.
    ajouterListeSansDoublon(orientation.concours, [
        "CREM",
        "FASTEF",
    ]);

    // Recommandations complémentaires selon la moyenne générale.
    if (moyenneBac >= 10.5) {
        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "FASTEF",
            "CREM",
        ]);
    }

    return orientation;
}
