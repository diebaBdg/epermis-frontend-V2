export interface User {
  id: string;
  matricule: string;
  username: string;
  nom: string;
  prenom: string;
  telephone: string;
  statut: string;
  role: string;
  grade?: string;
  zoneAffectation?: string;
  email: string;
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface LoginResponse {
  role: string;
  matricule: string;
  nomComplet: string;
  message: string;
  userId: string;
  token: string;
}
