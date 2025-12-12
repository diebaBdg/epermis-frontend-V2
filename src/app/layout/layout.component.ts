import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LogoutModalComponent } from '../pages/login/logout-modal.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LogoutModalComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  currentUser: any;
  sidebarCollapsed = false;
  showLogoutModal = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.showLogoutModal = true;
  }

  confirmLogout(): void {
    this.showLogoutModal = false;
    this.authService.logout();
  }

  cancelLogout(): void {
    this.showLogoutModal = false;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'ADMIN';
  }

  isInspecteur(): boolean {
    return this.currentUser?.role === 'INSPECTEUR';
  }

  getInitials(): string {
    if (!this.currentUser?.nomComplet) return 'U';
    const names = this.currentUser.nomComplet.split(' ');
    return names.map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }
}