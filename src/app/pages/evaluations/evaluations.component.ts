import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { Evaluation } from '../../models/evaluation.model';

@Component({
  selector: 'app-evaluations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './evaluations.component.html',
  styleUrls: ['./evaluations.component.css']
})
export class EvaluationsComponent implements OnInit {
  evaluations: Evaluation[] = [];
  loading = false;

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loading = true;
    this.evaluationService.getMesEvaluations().subscribe({
      next: (evaluations) => {
        this.evaluations = evaluations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading evaluations:', err);
        this.loading = false;
      }
    });
  }
}
