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

export type LocationUser = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
};

export type Location = {
  id: number;
  voiture_id: number;
  voiture?: LocationVoiture;
  user?: LocationUser;
  date_debut: string;
  date_fin: string;
  lieu_prise_en_charge: string;
  lieu_retour: string;
  statut: LocationStatut;
  montant_total?: number | string;
  created_at?: string;
};

export type LocationFilters = {
  statut?: LocationStatut;
  voiture_id?: number;
};

export type PaginatedLocations = {
  locations: {
    current_page: number;
    data: Location[];
    last_page?: number;
    total?: number;
  };
};
