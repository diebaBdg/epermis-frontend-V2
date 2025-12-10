import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../services/evaluation.service';
import { CategorieEvaluationPermis } from '../../models/evaluation.model';

@Component({
  selector: 'app-categories-evaluation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories-evaluation.component.html',
  styleUrls: ['./categories-evaluation.component.css']
})
export class CategoriesEvaluationComponent implements OnInit {
  categories: CategorieEvaluationPermis[] = [];
  loading = false;

  constructor(private evaluationService: EvaluationService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.evaluationService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }
}
