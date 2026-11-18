
import type { OrientationBase } from "../../types";
import {
    ajouterListeSansDoublon,
    creerOrientationBase,
} from "../commun";

/**
 * Calcule les filières et concours recommandés
 * pour un candidat de la série T.
 */
export function orienterT(
    moyenneMatieresTechniques: number,
    moyenneBac: number
): OrientationBase {
    const orientation = creerOrientationBase();

    // Très bon niveau technique.
    if (moyenneMatieresTechniques >= 14) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Télécommunications et Électronique",
            "Génie électrique",
            "Génie mécanique",
            "Énergies renouvelables",
            "Technologies agroalimentaires",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "ESP",
            "EPT",
            "IPSL",
        ]);
    }

    // Niveau technique satisfaisant.
    else if (moyenneMatieresTechniques >= 10) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Télécommunications et Électronique",
            "Génie électrique",
            "Génie mécanique",
            "Énergies renouvelables",
            "Technologies agroalimentaires",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "ESP",
            "EPT",
            "IPSL",
            "FASTEF",
        ]);
    }

    // Niveau technique inférieur à 10.
    else {
        ajouterListeSansDoublon(orientation.filieres, [
            "Formation professionnelle industrielle",
            "Maintenance industrielle",
            "Électricité",
            "Mécanique",
        ]);
    }

    // Recommandations complémentaires selon la moyenne générale.
    if (moyenneBac >= 10.4) {
        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "ESP",
            "EPT",
            "IPSL",
        ]);
    }

    return orientation;
}
