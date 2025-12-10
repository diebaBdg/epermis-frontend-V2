export interface Evaluation {
  id: string;
  numeroDossierCandidat: string;
  matriculeInspecteur: string;
  codeTypePermis: string;
  commentaire: string;
  statut: 'ADMIS' | 'AJOURNE';
  signatureInspecteur: string;
  dateEnregistrement: string;
  resultatsCategories: any;
}

export interface CategorieEvaluationPermis {
  id: string;
  nom: string;
  typePermis: string;
  criteresTemplate: any;
  score?: number;
  scoreMax: number;
  pourcentage?: number;
  valide?: boolean;
}
