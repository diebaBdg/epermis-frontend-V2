import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluationService } from '../../services/evaluation.service';
import { TypePermisService } from '../../services/type-permis.service';
import { CategorieEvaluationPermis } from '../../models/evaluation.model';
import { TypePermis } from '../../models/type-permis.model';

@Component({
  selector: 'app-categories-evaluation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories-evaluation.component.html',
  styleUrls: ['./categories-evaluation.component.css']
})
export class CategoriesEvaluationComponent implements OnInit {
  categories: CategorieEvaluationPermis[] = [];
  filteredCategories: CategorieEvaluationPermis[] = [];
  typesPermis: TypePermis[] = [];
  searchQuery = '';
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedCategorie: CategorieEvaluationPermis | null = null;
  viewMode: 'grid' | 'table' = 'grid';

  categorieForm = {
    nom: '',
    typePermis: '',
    scoreMax: '',
    criteresTemplate: { criteres: [] as any[] }
  };

  constructor(
    private evaluationService: EvaluationService,
    private typePermisService: TypePermisService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTypesPermis();
  }

  loadCategories(): void {
    this.loading = true;
    this.evaluationService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = categories;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
      }
    });
  }

  loadTypesPermis(): void {
    this.typePermisService.getTypesPermis().subscribe({
      next: (types) => {
        this.typesPermis = types.filter(t => t.actif);
      },
      error: (err) => console.error('Error loading types permis:', err)
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCategories = this.categories;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCategories = this.categories.filter(categorie =>
        categorie.nom.toLowerCase().includes(query) ||
        categorie.typePermis.toLowerCase().includes(query)
      );
    }
  }

  toggleViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCategorie = null;
    this.categorieForm = {
      nom: '',
      typePermis: '',
      scoreMax: '',
      criteresTemplate: { criteres: [] }
    };
    this.showModal = true;
  }

  openEditModal(categorie: CategorieEvaluationPermis): void {
    this.isEditMode = true;
    this.selectedCategorie = categorie;
    this.categorieForm = {
      nom: categorie.nom,
      typePermis: categorie.typePermis,
      scoreMax: categorie.scoreMax?.toString() || '',
      criteresTemplate: categorie.criteresTemplate || { criteres: [] }
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.categorieForm = {
      nom: '',
      typePermis: '',
      scoreMax: '',
      criteresTemplate: { criteres: [] }
    };
    this.selectedCategorie = null;
  }

  onSubmit(): void {
    if (!this.categorieForm.nom || !this.categorieForm.typePermis || !this.categorieForm.scoreMax) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;
    const formData = {
      ...this.categorieForm,
      scoreMax: parseInt(this.categorieForm.scoreMax)
    };

    if (this.isEditMode && this.selectedCategorie) {
      this.evaluationService.updateCategorie(this.selectedCategorie.id, formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating categorie:', err);
          this.loading = false;
          alert('Erreur lors de la mise à jour de la catégorie');
        }
      });
    } else {
      this.evaluationService.createCategorie(formData).subscribe({
        next: () => {
          this.loadCategories();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating categorie:', err);
          this.loading = false;
          alert('Erreur lors de la création de la catégorie');
        }
      });
    }
  }

  deleteCategorie(categorie: CategorieEvaluationPermis): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${categorie.nom}" ?`)) {
      return;
    }

    this.evaluationService.deleteCategorie(categorie.id).subscribe({
      next: () => {
        this.loadCategories();
      },
      error: (err) => {
        console.error('Error deleting categorie:', err);
        alert('Erreur lors de la suppression de la catégorie');
      }
    });
  }

  addCritere(): void {
    this.categorieForm.criteresTemplate.criteres.push({
      nom: '',
      points: 1
    });
  }

  removeCritere(index: number): void {
    this.categorieForm.criteresTemplate.criteres.splice(index, 1);
  }
}