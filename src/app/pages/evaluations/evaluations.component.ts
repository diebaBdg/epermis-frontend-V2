import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin, map } from 'rxjs';
import { EvaluationService } from '../../services/evaluation.service';
import { AuthService } from '../../services/auth.service';
import { InspecteurService } from '../../services/inspecteur.service';
import { Evaluation, EvaluationStats } from '../../models/evaluation.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  evaluationsWithInspecteurs: any[] = [];
  inspecteursMap: Map<string, User> = new Map();
  
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

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService,
    private inspecteurService: InspecteurService
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
      inspecteurs: this.userRole === 'ADMIN' ? this.loadInspecteurs() : of([])
    }).subscribe({
      next: ({ evaluations, stats, inspecteurs }) => {
        this.evaluations = evaluations;
        this.stats = stats;
        
        // Créer la map des inspecteurs
        if (inspecteurs.length > 0) {
          inspecteurs.forEach(inspecteur => {
            this.inspecteursMap.set(inspecteur.matricule, inspecteur);
          });
          
          // Préparer les données avec les noms des inspecteurs
          this.evaluationsWithInspecteurs = evaluations.map(evalItem => ({
            ...evalItem,
            inspecteurDisplay: this.getInspecteurDisplay(evalItem.matriculeInspecteur)
          }));
        } else {
          // Si pas d'inspecteurs ou rôle inspecteur
          this.evaluationsWithInspecteurs = evaluations.map(evalItem => ({
            ...evalItem,
            inspecteurDisplay: evalItem.matriculeInspecteur
          }));
        }
        
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
    return this.evaluationService.getStats().pipe(
      map(stats => {
        // Si le backend ne fournit pas scoreMoyen, on le calcule nous-mêmes
        if (stats['scoreMoyen'] === undefined) {
          return {
            ...stats,
            // Le score moyen sera calculé après le chargement des évaluations
            scoreMoyen: 0
          };
        }
        return stats;
      })
    );
  }

  loadInspecteurs(): Observable<User[]> {
    return this.inspecteurService.getInspecteurs();
  }

  getInspecteurDisplay(matricule: string): string {
    const inspecteur = this.inspecteursMap.get(matricule);
    if (inspecteur) {
      return `${inspecteur.prenom} ${inspecteur.nom}`;
    }
    return matricule;
  }

  // Méthode pour calculer le score moyen à partir des évaluations
  calculateAverageScore(): number {
    if (this.evaluations.length === 0) return 0;
    
    // Calculer le score total à partir des résultats des catégories
    const totalScore = this.evaluations.reduce((sum, evaluation) => {
      let evaluationScore = 0;
      
      // Si resultatsCategories est un tableau
      if (Array.isArray(evaluation.resultatsCategories)) {
        evaluationScore = evaluation.resultatsCategories.reduce((catSum: number, categorie: any) => {
          return catSum + (categorie.score || 0);
        }, 0);
      }
      // Si resultatsCategories est un objet avec criteres
      else if (evaluation.resultatsCategories?.criteres) {
        evaluationScore = evaluation.resultatsCategories.criteres.reduce((critSum: number, critere: any) => {
          return critSum + (critere.points || 0);
        }, 0);
      }
      // Si score directement disponible
      else if (evaluation.resultatsCategories?.score) {
        evaluationScore = evaluation.resultatsCategories.score;
      }
      
      return sum + evaluationScore;
    }, 0);
    
    return Math.round(totalScore / this.evaluations.length);
  }

  // Méthode pour obtenir le score d'une évaluation
  getEvaluationScore(evaluation: Evaluation): string {
    let score = 0;
    let maxScore = 100; // Valeur par défaut
    
    if (Array.isArray(evaluation.resultatsCategories)) {
      score = evaluation.resultatsCategories.reduce((sum: number, categorie: any) => {
        return sum + (categorie.score || 0);
      }, 0);
      
      // Essayer de trouver le score max
      maxScore = evaluation.resultatsCategories.reduce((sum: number, categorie: any) => {
        return sum + (categorie.scoreMax || 0);
      }, 0) || 100;
    }
    else if (evaluation.resultatsCategories?.criteres) {
      score = evaluation.resultatsCategories.criteres.reduce((sum: number, critere: any) => {
        return sum + (critere.points || 0);
      }, 0);
    }
    else if (evaluation.resultatsCategories?.score) {
      score = evaluation.resultatsCategories.score;
      maxScore = evaluation.resultatsCategories.scoreMax || 100;
    }
    
    return `${score}/${maxScore}`;
  }

  // Calculer les statistiques locales si besoin
  calculateLocalStats(): void {
    const total = this.evaluations.length;
    const admis = this.evaluations.filter(e => e.statut === 'ADMIS').length;
    const ajoure = this.evaluations.filter(e => e.statut === 'AJOURNE').length;
    const scoreMoyen = this.calculateAverageScore();
    
    this.stats = {
      totalEvaluations: total,
      admis: admis,
      ajoure: ajoure,
      tauxReussite: total > 0 ? (admis / total) * 100 : 0,
      tauxEchec: total > 0 ? (ajoure / total) * 100 : 0,
      scoreMoyen: scoreMoyen
    };
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
}