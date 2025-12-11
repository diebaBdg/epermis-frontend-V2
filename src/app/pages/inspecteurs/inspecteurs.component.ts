import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InspecteurService } from '../../services/inspecteur.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-inspecteurs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inspecteurs.component.html',
  styleUrls: ['./inspecteurs.component.css']
})
export class InspecteursComponent implements OnInit {
  inspecteurs: User[] = [];
  filteredInspecteurs: User[] = [];
  searchQuery = '';
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedInspecteur: User | null = null;
  viewMode: 'grid' | 'table' = 'table';

  inspecteurForm = {
    matricule: '',
    username: '',
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    password: '',
    grade: '',
    zoneAffectation: '',
    statut: 'ACTIF'
  };

  constructor(
    private inspecteurService: InspecteurService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadInspecteurs();
  }

  loadInspecteurs(): void {
    this.loading = true;
    this.cdr.detectChanges();
    
    this.inspecteurService.getInspecteurs().subscribe({
      next: (inspecteurs) => {
        this.inspecteurs = inspecteurs;
        this.filteredInspecteurs = inspecteurs;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading inspecteurs:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredInspecteurs = this.inspecteurs;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredInspecteurs = this.inspecteurs.filter(inspecteur =>
        inspecteur.nom.toLowerCase().includes(query) ||
        inspecteur.prenom.toLowerCase().includes(query) ||
        inspecteur.matricule.toLowerCase().includes(query)
      );
    }
    this.cdr.detectChanges();
  }

  toggleViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
  }

  getInitials(inspecteur: User): string {
    return (inspecteur.prenom[0] + inspecteur.nom[0]).toUpperCase();
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedInspecteur = null;
    this.inspecteurForm = {
      matricule: '',
      username: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      password: '',
      grade: '',
      zoneAffectation: '',
      statut: 'ACTIF'
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  openEditModal(inspecteur: User): void {
    this.isEditMode = true;
    this.selectedInspecteur = inspecteur;
    this.inspecteurForm = {
      matricule: inspecteur.matricule,
      username: inspecteur.username,
      nom: inspecteur.nom,
      prenom: inspecteur.prenom,
      telephone: inspecteur.telephone,
      email: inspecteur.email || '',
      password: '',
      grade: inspecteur.grade || '',
      zoneAffectation: inspecteur.zoneAffectation || '',
      statut: inspecteur.statut || 'ACTIF'
    };
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.inspecteurForm = {
      matricule: '',
      username: '',
      nom: '',
      prenom: '',
      telephone: '',
      email: '',
      password: '',
      grade: '',
      zoneAffectation: '',
      statut: 'ACTIF'
    };
    this.selectedInspecteur = null;
    this.cdr.detectChanges();
  }

  onSubmit(): void {
    if (!this.inspecteurForm.nom || !this.inspecteurForm.prenom || !this.inspecteurForm.username) {
      alert('Veuillez remplir les champs obligatoires');
      return;
    }

    this.loading = true;
    this.cdr.detectChanges();
    
    const formData = { ...this.inspecteurForm };

    if (this.isEditMode && this.selectedInspecteur) {
           
      this.inspecteurService.updateUser(this.selectedInspecteur.id, formData).subscribe({
        next: () => {
          this.loadInspecteurs();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating inspecteur:', err);
          this.loading = false;
          alert('Erreur lors de la mise à jour de l\'inspecteur');
          this.cdr.detectChanges();
        }
      });
    } else {
      // Pour la création, le mot de passe est requis
      if (!formData.password) {
        alert('Le mot de passe est requis pour la création');
        this.loading = false;
        this.cdr.detectChanges();
        return;
      }
      
      this.inspecteurService.createInspecteurComplet(formData).subscribe({
        next: () => {
          this.loadInspecteurs();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating inspecteur:', err);
          this.loading = false;
          alert('Erreur lors de la création de l\'inspecteur');
          this.cdr.detectChanges();
        }
      });
    }
  }

  deleteInspecteur(inspecteur: User): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'inspecteur ${inspecteur.prenom} ${inspecteur.nom} ?`)) {
      return;
    }

    this.inspecteurService.deleteUser(inspecteur.id).subscribe({
      next: () => {
        this.loadInspecteurs();
      },
      error: (err) => {
        console.error('Error deleting inspecteur:', err);
        alert('Erreur lors de la suppression de l\'inspecteur');
        this.cdr.detectChanges();
      }
    });
  }
}