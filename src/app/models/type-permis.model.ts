export interface TypePermis {
  id: string;
  code: string;
  libelle: string;
  description: string;
  actif: boolean;
}

export interface CreateTypePermisRequest {
  code: string;
  libelle: string;
  description: string;
}
