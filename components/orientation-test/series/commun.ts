
import type { NiveauAdmission, OrientationBase } from "../types";

/**
 * Ajoute une valeur dans un tableau uniquement si elle n'existe pas déjà.
 */
export function ajouterSansDoublon(
    liste: string[],
    valeur: string
): void {
    const valeurNettoyee = valeur.trim();

    if (!valeurNettoyee) {
        return;
    }

    const existeDeja = liste.some(
        (element) =>
            element.toLowerCase() === valeurNettoyee.toLowerCase()
    );

    if (!existeDeja) {
        liste.push(valeurNettoyee);
    }
}

/**
 * Ajoute plusieurs valeurs sans créer de doublons.
 */
export function ajouterListeSansDoublon(
    liste: string[],
    valeurs: string[]
): void {
    valeurs.forEach((valeur) => {
        ajouterSansDoublon(liste, valeur);
    });
}

/**
 * Crée une base vide pour les recommandations d'une série.
 */
export function creerOrientationBase(): OrientationBase {
    return {
        filieres: [],
        concours: [],
    };
}

/**
 * Ajoute les concours complémentaires selon le niveau obtenu.
 *
 * Cette fonction reprend les recommandations communes
 * prévues dans le code initial.
 */
export function ajouterConcoursSelonNiveau(
    orientation: OrientationBase,
    niveau: NiveauAdmission
): OrientationBase {
    if (niveau === "passable" || niveau === "rattrapages") {
        ajouterListeSansDoublon(orientation.concours, [
            "CREM",
            "FASTEF",
            "ENA",
            "Polytech Diamniadio",
        ]);
    }

    return orientation;
}

/**
 * Fusionne deux listes de recommandations sans doublons.
 */
export function fusionnerOrientations(
    premiere: OrientationBase,
    deuxieme: OrientationBase
): OrientationBase {
    const resultat = creerOrientationBase();

    ajouterListeSansDoublon(resultat.filieres, premiere.filieres);
    ajouterListeSansDoublon(resultat.filieres, deuxieme.filieres);

    ajouterListeSansDoublon(resultat.concours, premiere.concours);
    ajouterListeSansDoublon(resultat.concours, deuxieme.concours);

    return resultat;
}