export type UserRole = "client" | "admin";

export type User = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  adresse?: string | null;
  num_permis?: string | null;
  date_naissance?: string | null;
  role: UserRole;
  created_at?: string;
};

export type UserPayload = {
  nom: string;
  prenom: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  telephone?: string;
  adresse?: string;
  num_permis?: string;
  date_naissance?: string;
  role?: UserRole;
};

export type UserFilters = {
  search?: string;
  role?: UserRole;
  page?: number;
};

export type PaginatedUsers = {
  current_page: number;
  data: User[];
  last_page?: number;
  total?: number;
};
