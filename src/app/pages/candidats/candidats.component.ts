import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CandidatService } from '../../services/candidat.service';
import { TypePermisService } from '../../services/type-permis.service';
import { InspecteurService } from '../../services/inspecteur.service';
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
    private cdr: ChangeDetectorRef  // Ajout du ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCandidats();
    this.loadTypesPermis();
    this.loadInspecteurs();
  }

  loadCandidats(): void {
    this.loading = true;
    this.candidatService.getCandidats().subscribe({
      next: (candidats) => {
        this.candidats = candidats;
        this.filteredCandidats = [...candidats];
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

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredCandidats = [...this.candidats];
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredCandidats = this.candidats.filter(candidat =>
        candidat.nom.toLowerCase().includes(query) ||
        candidat.prenom.toLowerCase().includes(query) ||
        candidat.numeroDossier.toLowerCase().includes(query)
      );
    }
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
      inspecteurMatricule: ''
    };
    this.showModal = true;
  }

  openEditModal(candidat: Candidat): void {
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
      inspecteurMatricule: ''
    };
    this.selectedCandidat = null;
  }

  onSubmit(): void {
    if (!this.candidatForm.nom?.trim() || !this.candidatForm.prenom?.trim() || !this.candidatForm.numeroDossier?.trim()) {
      return;
    }

    this.loading = true;

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
        }
      });
    }
  }

  deleteCandidat(candidat: Candidat): void {
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
}