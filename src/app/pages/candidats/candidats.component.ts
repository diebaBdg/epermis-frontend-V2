import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatService } from '../../services/candidat.service';
import { TypePermisService } from '../../services/type-permis.service';
import { InspecteurService } from '../../services/inspecteur.service';
import { AuthService } from '../../services/auth.service';
import { Candidat, CreateCandidatRequest } from '../../models/candidat.model';
import { TypePermis } from '../../models/type-permis.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-candidats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './candidats.component.html',
  styleUrls: ['./candidats.component.css']
})
export class CandidatsComponent implements OnInit {
  candidats: Candidat[] = [];
  filteredCandidats: Candidat[] = [];
  typesPermis: TypePermis[] = [];
  inspecteurs: User[] = [];
  searchQuery = '';
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedCandidat: Candidat | null = null;
  viewMode: 'grid' | 'table' = 'table';
  
  currentPage = 1;
  itemsPerPage = 5;
  totalPages = 0;
  
  currentUser: any;
  isAdmin = false;
  isInspecteur = false;

  candidatForm: CreateCandidatRequest = {
    nom: '',
    prenom: '',
    autoEcole: '',
    typePermis: '',
    numeroDossier: '',
    dateEvaluation: '',
    inspecteurMatricule: ''
  };

  constructor(
    private candidatService: CandidatService,
    private typePermisService: TypePermisService,
    private inspecteurService: InspecteurService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.isAdmin = this.currentUser?.role === 'ADMIN';
    this.isInspecteur = this.currentUser?.role === 'INSPECTEUR';
    
    // Si inspecteur, assigner automatiquement son matricule
    if (this.isInspecteur) {
      this.candidatForm.inspecteurMatricule = this.currentUser.matricule;
    }
    
    this.loadCandidats();
    this.loadTypesPermis();
    
    // Charger les inspecteurs seulement si admin
    if (this.isAdmin) {
      this.loadInspecteurs();
    }
  }

  loadCandidats(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    // Le service filtre automatiquement selon le rôle
    this.candidatService.getCandidats().subscribe({
      next: (candidats) => {
        this.candidats = candidats;
        this.filteredCandidats = [...candidats];
        this.calculateTotalPages();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading candidats:', err);
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
      error: (err) => console.error('Error loading types permis:', err)
    });
  }

  loadInspecteurs(): void {
    this.inspecteurService.getInspecteursDisponibles().subscribe({
      next: (inspecteurs) => {
        this.inspecteurs = inspecteurs;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading inspecteurs:', err)
    });
  }

  // Méthodes de pagination
  getPaginatedCandidats(): Candidat[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredCandidats.slice(startIndex, endIndex);
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredCandidats.length / this.itemsPerPage);
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
    // Afficher maximum 5 numéros de page
    const maxPagesToShow = 5;
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);
    
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCandidats = [...this.candidats];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCandidats = this.candidats.filter(candidat =>
        candidat.nom.toLowerCase().includes(query) ||
        candidat.prenom.toLowerCase().includes(query) ||
        candidat.numeroDossier.toLowerCase().includes(query) ||
        candidat.autoEcole?.toLowerCase().includes(query)
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

  getInitials(candidat: Candidat): string {
    return (candidat.prenom[0] + candidat.nom[0]).toUpperCase();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedCandidat = null;
    this.candidatForm = {
      nom: '',
      prenom: '',
      autoEcole: '',
      typePermis: '',
      numeroDossier: '',
      dateEvaluation: '',
      inspecteurMatricule: this.isInspecteur ? this.currentUser.matricule : ''
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(candidat: Candidat): void {
    // Vérifier les permissions avant d'éditer
    if (this.isInspecteur && candidat.inspecteurMatricule !== this.currentUser.matricule) {
      alert('Vous ne pouvez modifier que vos propres candidats.');
      return;
    }
    
    this.isEditMode = true;
    this.selectedCandidat = candidat;
    this.candidatForm = {
      nom: candidat.nom,
      prenom: candidat.prenom,
      autoEcole: candidat.autoEcole,
      typePermis: candidat.typePermis,
      numeroDossier: candidat.numeroDossier,
      dateEvaluation: candidat.dateEvaluation,
      inspecteurMatricule: candidat.inspecteurMatricule || ''
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.candidatForm = {
      nom: '',
      prenom: '',
      autoEcole: '',
      typePermis: '',
      numeroDossier: '',
      dateEvaluation: '',
      inspecteurMatricule: this.isInspecteur ? this.currentUser.matricule : ''
    };
    this.selectedCandidat = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.candidatForm.nom?.trim() || !this.candidatForm.prenom?.trim() || !this.candidatForm.numeroDossier?.trim()) {
      return;
    }

    // Si inspecteur, forcer son matricule
    if (this.isInspecteur) {
      this.candidatForm.inspecteurMatricule = this.currentUser.matricule;
    }

    this.loading = true;
    this.cdr.detectChanges();

    if (this.isEditMode && this.selectedCandidat) {
      const updateData = {
        nom: this.candidatForm.nom,
        prenom: this.candidatForm.prenom,
        autoEcole: this.candidatForm.autoEcole,
        typePermis: this.candidatForm.typePermis,
        dateEvaluation: this.candidatForm.dateEvaluation
      };

      this.candidatService.updateCandidat(this.selectedCandidat.id, updateData).subscribe({
        next: () => {
          this.loadCandidats();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating candidat:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.candidatService.createCandidat(this.candidatForm).subscribe({
        next: () => {
          this.loadCandidats();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating candidat:', err);
          this.loading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteCandidat(candidat: Candidat): void {
    // Vérifier les permissions avant de supprimer
    if (this.isInspecteur && candidat.inspecteurMatricule !== this.currentUser.matricule) {
      alert('Vous ne pouvez supprimer que vos propres candidats.');
      return;
    }
    
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le candidat ${candidat.prenom} ${candidat.nom} ?`)) {
      return;
    }

    this.candidatService.deleteCandidat(candidat.id).subscribe({
      next: () => {
        this.loadCandidats();
      },
      error: (err) => {
        console.error('Error deleting candidat:', err);
      }
    });
  }

  canEditCandidat(candidat: Candidat): boolean {
    if (this.isAdmin) return true;
    if (this.isInspecteur) {
      return candidat.inspecteurMatricule === this.currentUser.matricule;
    }
    return false;
  }

  canDeleteCandidat(candidat: Candidat): boolean {
    if (this.isAdmin) return true;
    if (this.isInspecteur) {
      return candidat.inspecteurMatricule === this.currentUser.matricule;
    }
    return false;
  }
}