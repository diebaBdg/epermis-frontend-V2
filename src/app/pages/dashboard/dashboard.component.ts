import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, forkJoin, of } from 'rxjs';
import { CandidatService } from '../../services/candidat.service';
import { InspecteurService } from '../../services/inspecteur.service';
import { EvaluationService } from '../../services/evaluation.service';
import { TypePermisService } from '../../services/type-permis.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
   currentUser: any;
  stats = {
    totalCandidats: 0,
    inspecteursActifs: 0,
    totalEvaluations: 0,
    typesPermis: 0
  };

  evaluationStats = {
    totalEvaluations: 0,
    admis: 0,
    ajoure: 0,
    tauxReussite: 0,
    tauxEchec: 0
  };

  candidatStats = {
    total: 0,
    evalues: 0,
    nonEvalues: 0,
    tauxEvaluation: 0
  };

  recentEvaluations: any[] = [];
  inspecteursDisponibles: any[] = [];
  loading = true;

  constructor(
    private candidatService: CandidatService,
    private inspecteurService: InspecteurService,
    private evaluationService: EvaluationService,
    private typePermisService: TypePermisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      inspecteurs: this.inspecteurService.getInspecteurs(),
      evaluations: this.evaluationService.getEvaluations().pipe(
        catchError(err => {
          console.warn('Erreur lors du chargement des évaluations:', err);
          return of([]);
        })
      ),
      evaluationStats: this.evaluationService.getStats().pipe(
        catchError(err => {
          console.warn('Erreur lors du chargement des stats évaluations:', err);
          return of({
            totalEvaluations: 0,
            admis: 0,
            ajoure: 0,
            tauxReussite: 0,
            tauxEchec: 0
          });
        })
      ),
      candidats: this.candidatService.getCandidats({}).pipe(
        catchError(err => {
          console.warn('Erreur lors du chargement des candidats:', err);
          return of([]);
        })
      ),
      typesPermis: this.typePermisService.getTypesPermis(),
      statsCandidat: this.candidatService.getStats()
    }).subscribe({
      next: (results) => {
        // Stats inspecteurs
        this.stats.inspecteursActifs = results.inspecteurs.filter(i => i.statut === 'ACTIF').length;
        this.inspecteursDisponibles = results.inspecteurs.slice(0, 4);

        // Stats évaluations
        this.recentEvaluations = results.evaluations.slice(0, 4);
        this.stats.totalEvaluations = results.evaluations.length;
        this.evaluationStats = results.evaluationStats;

        // Stats candidats
        const candidatsEvalues = results.candidats.filter(c => c.estEvalue).length;
        this.candidatStats = {
          total: results.candidats.length,
          evalues: candidatsEvalues,
          nonEvalues: results.candidats.length - candidatsEvalues,
          tauxEvaluation: results.candidats.length > 0 
            ? (candidatsEvalues / results.candidats.length) * 100 
            : 0
        };

        // Stats types permis
        this.stats.typesPermis = results.typesPermis.filter(t => t.actif).length;

        if (results.statsCandidat) {
          this.stats.totalCandidats = results.statsCandidat.totalCandidats || 0;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getTimeAgo(date: string): string {
    const now = new Date();
    const evaluationDate = new Date(date);
    const diffInMs = now.getTime() - evaluationDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `Il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    }
  }

  getInitials(name: string): string {
    if (!name) return 'N/A';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  isInspecteur(): boolean {
    return this.currentUser?.role === 'INSPECTEUR';
  }

}