import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypePermisService } from '../../services/type-permis.service';
import { TypePermis, CreateTypePermisRequest } from '../../models/type-permis.model';

@Component({
  selector: 'app-types-permis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './types-permis.component.html',
  styleUrls: ['./types-permis.component.css']
})
export class TypesPermisComponent implements OnInit {
  typesPermis: TypePermis[] = [];
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedType: TypePermis | null = null;

  typeForm: CreateTypePermisRequest & { actif?: boolean } = {
    code: '',
    libelle: '',
    description: '',
    actif: true
  };

  constructor(private typePermisService: TypePermisService) {}

  ngOnInit(): void {
    this.loadTypesPermis();
  }

  loadTypesPermis(): void {
    this.loading = true;
    this.typePermisService.getTypesPermis().subscribe({
      next: (types) => {
        this.typesPermis = types;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading types permis:', err);
        this.loading = false;
      }
    });
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedType = null;
    this.typeForm = {
      code: '',
      libelle: '',
      description: '',
      actif: true
    };
    this.showModal = true;
  }

  openEditModal(type: TypePermis): void {
    this.isEditMode = true;
    this.selectedType = type;
    this.typeForm = {
      code: type.code,
      libelle: type.libelle,
      description: type.description,
      actif: type.actif
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.typeForm = {
      code: '',
      libelle: '',
      description: '',
      actif: true
    };
    this.selectedType = null;
  }

  onSubmit(): void {
    if (!this.typeForm.code?.trim() || !this.typeForm.libelle?.trim()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedType) {
      const updateData = {
        libelle: this.typeForm.libelle,
        description: this.typeForm.description,
        actif: this.typeForm.actif
      };

      this.typePermisService.updateTypePermis(this.selectedType.id, updateData).subscribe({
        next: () => {
          this.loadTypesPermis();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating type permis:', err);
          this.loading = false;
        }
      });
    } else {
      const createData: CreateTypePermisRequest = {
        code: this.typeForm.code,
        libelle: this.typeForm.libelle,
        description: this.typeForm.description
      };

      this.typePermisService.createTypePermis(createData).subscribe({
        next: () => {
          this.loadTypesPermis();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating type permis:', err);
          this.loading = false;
        }
      });
    }
  }

  deleteType(type: TypePermis): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le type de permis "${type.libelle}" ?`)) {
      return;
    }

    this.typePermisService.deleteTypePermis(type.id).subscribe({
      next: () => {
        this.loadTypesPermis();
      },
      error: (err) => {
        console.error('Error deleting type permis:', err);
      }
    });
  }
}
