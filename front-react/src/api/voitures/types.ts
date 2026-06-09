export type Voiture = {
  id: number;
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  prix_par_jour: number;
  disponible: boolean;
  kilometrage: number;
  image?: string | null;
  created_at?: string;
};

export type VoiturePayload = {
  marque: string;
  modele: string;
  annee: number;
  immatriculation: string;
  couleur: string;
  prix_par_jour: number;
  disponible?: boolean;
  kilometrage?: number;
};

export type VoitureFilters = {
  disponible?: boolean;
  marque?: string;
  prix_max?: number;
  page?: number;
};

export type PaginatedVoitures = {
  current_page: number;
  data: Voiture[];
  last_page?: number;
  total?: number;
  per_page?: number;
};
