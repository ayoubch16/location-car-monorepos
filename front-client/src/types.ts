export type Voiture = {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  couleur: string;
  immatriculation: string;
  kilometrage?: number;
  prix_par_jour: number | string;
  disponible: boolean;
};

export type LocationStatut =
  | "en_attente"
  | "confirmee"
  | "en_cours"
  | "terminee"
  | "annulee";

export type LocationVoiture = {
  id: number;
  marque: string;
  modele: string;
  immatriculation: string;
};

export type Resa = {
  id: number;
  voiture_id: number;
  voiture?: LocationVoiture;
  date_debut: string;
  date_fin: string;
  duree_jours: number;
  lieu_prise_en_charge: string;
  lieu_retour: string;
  statut: LocationStatut;
  montant_total?: number | string;
};

export type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
};
