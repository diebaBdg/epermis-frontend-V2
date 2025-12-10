import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { Role, RoleRequest } from '../../models/role.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  roles: Role[] = [];
  filteredRoles: Role[] = [];
  searchQuery = '';
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedRole: Role | null = null;

  roleForm: RoleRequest = {
    libelle: ''
  };

  constructor(private roleService: RoleService) {}

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = roles;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading = false;
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) {
      this.filteredRoles = this.roles;
    } else {
      const query = this.searchQuery.toLowerCase();
      this.filteredRoles = this.roles.filter(role =>
        role.libelle.toLowerCase().includes(query)
      );
    }
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedRole = null;
    this.roleForm = { libelle: '' };
    this.showModal = true;
  }

  openEditModal(role: Role): void {
    this.isEditMode = true;
    this.selectedRole = role;
    this.roleForm = { libelle: role.libelle };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.roleForm = { libelle: '' };
    this.selectedRole = null;
  }

  onSubmit(): void {
    if (!this.roleForm.libelle.trim()) {
      return;
    }

    this.loading = true;

    if (this.isEditMode && this.selectedRole) {
      this.roleService.updateRole(this.selectedRole.id, this.roleForm).subscribe({
        next: () => {
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating role:', err);
          this.loading = false;
        }
      });
    } else {
      this.roleService.createRole(this.roleForm).subscribe({
        next: () => {
          this.loadRoles();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error creating role:', err);
          this.loading = false;
        }
      });
    }
  }

  deleteRole(role: Role): void {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.libelle}" ?`)) {
      return;
    }

    this.roleService.deleteRole(role.id).subscribe({
      next: () => {
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error deleting role:', err);
      }
    });
  }

  getUserCount(role: Role): number {
    return Math.floor(Math.random() * 50) + 1;
  }
}
