
import type { OrientationBase } from "../../types";
import {
    ajouterListeSansDoublon,
    creerOrientationBase,
} from "../commun";

/**
 * Calcule les filières et concours recommandés
 * pour un candidat de la série STEG.
 */
export function orienterSTEG(
    moyenneMatieresGestion: number,
    moyenneBac: number
): OrientationBase {
    const orientation = creerOrientationBase();

    // Très bon niveau en économie et gestion.
    if (moyenneMatieresGestion >= 14) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Sciences économiques et de gestion",
            "Gestion des entreprises",
            "Banque et Finance",
            "Comptabilité",
            "Finance",
            "Administration économique et sociale (AES)",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "Concours de l'ESP",
            "Polytech Diamniadio",
            "ENA",
        ]);
    }

    // Niveau satisfaisant en économie et gestion.
    else if (moyenneMatieresGestion >= 10) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Économie et Gestion",
            "Gestion des entreprises",
            "Banque et Finance",
            "Comptabilité",
            "Administration économique et sociale (AES)",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "ENA",
            "CREM",
            "FASTEF",
        ]);
    }

    // Niveau inférieur à 10.
    else {
        ajouterListeSansDoublon(orientation.filieres, [
            "Administration économique et sociale (AES)",
            "Gestion",
            "Tourisme et hôtellerie",
        ]);
    }

    // Recommandations complémentaires selon la moyenne générale.
    if (moyenneBac >= 10.5) {
        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "ENA",
            "ESP",
        ]);
    }

    return orientation;
}
