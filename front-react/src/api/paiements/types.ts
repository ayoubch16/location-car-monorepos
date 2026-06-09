export type PaiementStatut = "en_attente" | "paye" | "rembourse" | "annule";

export type Paiement = {
  id: number;
  location_id: number;
  location?: {
    id: number;
    date_debut: string;
    date_fin: string;
    voiture?: { marque: string; modele: string };
    user?: { nom: string; prenom: string };
  };
  montant: number;
  methode?: string | null;
  statut: PaiementStatut;
  created_at: string;
};

export type PaiementFilters = {
  statut?: PaiementStatut;
};

export type PaginatedPaiements = {
  current_page: number;
  data: Paiement[];
  last_page?: number;
  total?: number;
};
