import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, map, of } from 'rxjs';
import { EvaluationService } from '../../services/evaluation.service';
import { AuthService } from '../../services/auth.service';
import { InspecteurService } from '../../services/inspecteur.service';
import { CandidatService } from '../../services/candidat.service';
import { Evaluation, EvaluationStats } from '../../models/evaluation.model';
import { User } from '../../models/user.model';
import { Candidat } from '../../models/candidat.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  evaluationsWithData: any[] = [];
  inspecteursMap: Map<string, User> = new Map();
  candidatsMap: Map<string, Candidat> = new Map();

  stats: EvaluationStats = {
    totalEvaluations: 0,
    admis: 0,
    ajoure: 0,
    tauxReussite: 0,
    tauxEchec: 0
  };

  loading = false;
  errorMessage = '';
  userRole: string = '';
  userName: string = '';

  showDetailModal = false;
  selectedEvaluation: any = null;

  page = 0;
  size = 100;

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private inspecteurService: InspecteurService,
    private candidatService: CandidatService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userRole = user?.role || '';
    this.userName = user?.nomComplet || '';

    this.loadAllData();
  }

  loadAllData(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      evaluations: this.loadEvaluations(),
      stats: this.loadStats(),
      inspecteurs: this.userRole === 'ADMIN' ? this.loadInspecteurs() : of([]),
      candidats: this.loadCandidats()
    }).subscribe({
      next: ({ evaluations, stats, inspecteurs, candidats }) => {
        this.evaluations = evaluations;
        this.stats = stats;

        if (inspecteurs.length > 0) {
          inspecteurs.forEach((inspecteur: User) => {
            this.inspecteursMap.set(inspecteur.matricule, inspecteur);
          });
        }

        candidats.forEach((candidat: Candidat) => {
          this.candidatsMap.set(candidat.numeroDossier, candidat);
        });

        this.evaluationsWithData = evaluations.map(evalItem => ({
          ...evalItem,
          inspecteurDisplay: this.getInspecteurDisplay(evalItem.matriculeInspecteur),
          candidatDisplay: this.getCandidatDisplay(evalItem.numeroDossierCandidat)
        }));

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.errorMessage = 'Erreur lors du chargement des données';
        this.loading = false;
      }
    });
  }

  loadEvaluations(): Observable<Evaluation[]> {
    return this.evaluationService.getEvaluations();
  }

  loadStats(): Observable<EvaluationStats> {
    return this.evaluationService.getStats();
  }

  loadInspecteurs(): Observable<User[]> {
    return this.inspecteurService.getInspecteurs();
  }

  loadCandidats(): Observable<Candidat[]> {
    return this.candidatService.getCandidats({ estEvalue: true });
  }

  getInspecteurDisplay(matricule: string): string {
    const inspecteur = this.inspecteursMap.get(matricule);
    if (inspecteur) {
      return `${inspecteur.prenom} ${inspecteur.nom}`;
    }
    return matricule;
  }

  getCandidatDisplay(numeroDossier: string): string {
    const candidat = this.candidatsMap.get(numeroDossier);
    if (candidat) {
      return `${candidat.prenom} ${candidat.nom}`;
    }
    return numeroDossier;
  }

  getBadgeClass(statut: string): string {
    return statut === 'ADMIS' ? 'badge-success' : 'badge-danger';
  }

  getStatutText(statut: string): string {
    return statut === 'ADMIS' ? 'Réussi' : 'Échoué';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  openDetailModal(evaluation: any): void {
    this.selectedEvaluation = evaluation;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEvaluation = null;
  }

  getResultatsCategories(): any[] {
    if (!this.selectedEvaluation?.resultatsCategories) {
      return [];
    }

    const resultats = this.selectedEvaluation.resultatsCategories;

    if (Array.isArray(resultats)) {
      return resultats;
    }

    if (resultats.criteres && Array.isArray(resultats.criteres)) {
      return resultats.criteres.map((critere: any) => ({
        nom: critere.nomCategorie || critere.nom || 'Catégorie',
        score: critere.points || 0,
        scoreMax: critere.pointsMax || 0
      }));
    }

    return [];
  }

  getTotalScore(): number {
    const categories = this.getResultatsCategories();
    return categories.reduce((sum, cat) => sum + (cat.score || 0), 0);
  }

  getTotalScoreMax(): number {
    const categories = this.getResultatsCategories();
    return categories.reduce((sum, cat) => sum + (cat.scoreMax || 0), 0);
  }
}
