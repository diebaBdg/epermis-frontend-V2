import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

    this.candidatService.getCandidats().subscribe({
      next: (candidats) => {
        this.stats.totalCandidats = candidats.length;
      },
      error: (err) => console.error('Error loading candidats:', err)
    });

    this.inspecteurService.getInspecteurs().subscribe({
      next: (inspecteurs) => {
        this.stats.inspecteursActifs = inspecteurs.filter(i => i.statut === 'ACTIF').length;
      },
      error: (err) => console.error('Error loading inspecteurs:', err)
    });

    this.evaluationService.getMesEvaluations().subscribe({
      next: (evaluations) => {
        this.stats.totalEvaluations = evaluations.length;
        this.recentEvaluations = evaluations.slice(0, 4);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading evaluations:', err);
        this.loading = false;
      }
    });

    this.typePermisService.getTypesPermis().subscribe({
      next: (types) => {
        this.stats.typesPermis = types.filter(t => t.actif).length;
      },
      error: (err) => console.error('Error loading types permis:', err)
    });

    this.inspecteurService.getInspecteursDisponibles().subscribe({
      next: (inspecteurs) => {
        this.inspecteursDisponibles = inspecteurs.slice(0, 4);
      },
      error: (err) => console.error('Error loading inspecteurs disponibles:', err)
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
