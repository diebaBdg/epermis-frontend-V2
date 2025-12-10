export interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  telephone?: string;
  autoEcole: string;
  typePermis: string;
  numeroDossier: string;
  dateEvaluation: string;
  inspecteurMatricule?: string;
  estEvalue: boolean;
  estReplanifie: boolean;
  motifReplanification?: string;
  dateReplanification?: string;
  dateCreation: string;
}

export interface CreateCandidatRequest {
  nom: string;
  prenom: string;
  autoEcole: string;
  typePermis: string;
  numeroDossier: string;
  dateEvaluation: string;
  inspecteurMatricule?: string;
}
