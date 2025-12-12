import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  loading = false;
  error = '';
  success = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email.trim()) {
      this.error = 'Veuillez entrer votre adresse email';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Veuillez entrer une adresse email valide';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email: this.email }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 404) {
          this.error = 'Aucun compte associé à cette adresse email';
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}