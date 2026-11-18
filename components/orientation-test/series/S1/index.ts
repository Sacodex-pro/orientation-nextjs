
import type { OrientationBase } from "../../types";
import {
    ajouterListeSansDoublon,
    creerOrientationBase,
} from "../commun";

/**
 * Calcule les filières et concours recommandés
 * pour un candidat de la série S1.
 */
export function orienterS1(
    moyenneMatieresScientifiques: number,
    moyenneBac: number
): OrientationBase {
    const orientation = creerOrientationBase();

    // Très bon niveau scientifique.
    if (moyenneMatieresScientifiques >= 14) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Informatique",
            "Mathématiques, Physique et Informatique (MPI)",
            "Ingénierie",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "EPT",
            "ESP",
            "IPSL",
            "ISFAR",
            "Polytech Diamniadio",
            "ENSMG",
            "UFR Sciences de l'ingénieur",
        ]);
    }

    // Niveau scientifique satisfaisant.
    else if (moyenneMatieresScientifiques >= 10) {
        ajouterListeSansDoublon(orientation.filieres, [
            "Chimie",
            "Physique-Chimie",
            "Mathématiques, Physique et Informatique (MPI)",
            "Économie et Gestion",
            "Sciences de la Terre et de l'Environnement",
        ]);

        ajouterListeSansDoublon(orientation.concours, [
            "EPT",
            "ESP",
            "IPSL",
            "ISFAR",
            "Polytech Diamniadio",
            "ENSMG",
            "UFR Sciences de l'ingénieur",
        ]);
    }

    // Niveau scientifique inférieur à 10.
    else {
        ajouterListeSansDoublon(orientation.filieres, [
            "Agronomie",
            "Aquaculture",
            "Mathématiques, Physique et Informatique (MPI)",
            "FASEG",
        ]);
    }

    // Recommandations complémentaires selon la moyenne générale.
    if (moyenneBac >= 10.4) {
        ajouterListeSansDoublon(orientation.concours, [
            "Polytech Diamniadio",
            "ISFAR",
            "ESEA",
            "ESP",
            "UFR Sciences de l'ingénieur",
        ]);
    }

    return orientation;
}