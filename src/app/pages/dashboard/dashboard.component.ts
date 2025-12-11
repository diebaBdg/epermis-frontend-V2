import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
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
  stats = {
    totalCandidats: 0,
    inspecteursActifs: 0,
    totalEvaluations: 0,
    typesPermis: 0
  };

  recentEvaluations: any[] = [];
  inspecteursDisponibles: any[] = [];
  loading = true;

  constructor(
    private candidatService: CandidatService,
    private inspecteurService: InspecteurService,
    private evaluationService: EvaluationService,
    private typePermisService: TypePermisService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;

    forkJoin({
      inspecteurs: this.inspecteurService.getInspecteurs(),
      evaluations: this.evaluationService.getMesEvaluations(),
      typesPermis: this.typePermisService.getTypesPermis(),
      stats: this.candidatService.getStats()
    }).subscribe({
      next: (results) => {
        this.stats.inspecteursActifs = results.inspecteurs.filter(i => i.statut === 'ACTIF').length;
        this.inspecteursDisponibles = results.inspecteurs.slice(0, 4);

        this.recentEvaluations = results.evaluations.slice(0, 4);
        this.stats.totalEvaluations = results.evaluations.length;

        this.stats.typesPermis = results.typesPermis.filter(t => t.actif).length;

        if (results.stats) {
          this.stats.totalCandidats = results.stats.totalCandidats || 0;
        }

        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.loading = false;
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
}
