import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  viewMode: 'grid' | 'table' = 'table';

  // Propriétés de pagination
  currentPage = 1;
  itemsPerPage = 6;
  totalPages = 0;

  categorieForm = {
    nom: '',
    typePermis: '',
    scoreMax: '',
    criteresTemplate: { criteres: [] as any[] }
  };

  constructor(
    private evaluationService: EvaluationService,
    private typePermisService: TypePermisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadTypesPermis();
  }

  loadCategories(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.evaluationService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filteredCategories = categories;
        this.calculateTotalPages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTypesPermis(): void {
    this.typePermisService.getTypesPermis().subscribe({
      next: (types) => {
        this.typesPermis = types.filter(t => t.actif);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading types permis:', err);
        this.cdr.detectChanges();
      }
    });
  }

  // Méthodes de pagination
  getPaginatedCategories(): CategorieEvaluationPermis[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCategories.slice(startIndex, endIndex);
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredCategories.length / this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.cdr.detectChanges();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
    this.currentPage = 1; // Reset to first page on search
    this.calculateTotalPages();
    this.cdr.detectChanges();
  }

  toggleViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.categorieForm.nom || !this.categorieForm.typePermis || !this.categorieForm.scoreMax) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
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
          this.cdr.detectChanges();
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
          this.cdr.detectChanges();
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
        this.cdr.detectChanges();
      }
    });
  }

  addCritere(): void {
    this.categorieForm.criteresTemplate.criteres.push({
      nom: '',
      points: 1
    });
    this.cdr.detectChanges();
  }

  removeCritere(index: number): void {
    this.categorieForm.criteresTemplate.criteres.splice(index, 1);
    this.cdr.detectChanges();
  }
}