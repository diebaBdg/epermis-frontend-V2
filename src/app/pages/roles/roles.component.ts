import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../services/role.service';
import { UserService } from '../../services/user.service';
import { Role, RoleRequest } from '../../models/role.model';
import { User } from '../../models/user.model';

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
  roleUserCounts: Map<string, number> = new Map();
  users: User[] = [];
  searchQuery = '';
  loading = false;
  showModal = false;
  isEditMode = false;
  selectedRole: Role | null = null;
  viewMode: 'grid' | 'table' = 'grid'; // Ajout du mode de vue

  roleForm: RoleRequest = {
    libelle: ''
  };

  constructor(
    private roleService: RoleService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadRoles();
    this.loadUsers();
  }

  loadRoles(): void {
    this.loading = true;
    this.roleService.getRoles().subscribe({
      next: (roles) => {
        this.roles = roles;
        this.filteredRoles = roles;
        this.calculateUserCounts();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading roles:', err);
        this.loading = false;
      }
    });
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.calculateUserCounts();
      },
      error: (err) => {
        console.error('Error loading users:', err);
      }
    });
  }

  calculateUserCounts(): void {
    if (this.users.length === 0) return;
    
    this.roleUserCounts.clear();
    this.users.forEach(user => {
      const currentCount = this.roleUserCounts.get(user.role) || 0;
      this.roleUserCounts.set(user.role, currentCount + 1);
    });
  }

  getUserCount(roleLibelle: string): number {
    return this.roleUserCounts.get(roleLibelle) || 0;
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

  // Nouvelle méthode pour basculer entre les vues
  toggleViewMode(mode: 'grid' | 'table'): void {
    this.viewMode = mode;
  }

  // Méthode pour obtenir les initiales (pour la vue grille)
  getInitials(role: Role): string {
    return role.libelle.substring(0, 2).toUpperCase();
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
    const userCount = this.getUserCount(role.libelle);
    if (userCount > 0) {
      alert(`Impossible de supprimer ce rôle. Il est utilisé par ${userCount} utilisateur(s).`);
      return;
    }

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
}