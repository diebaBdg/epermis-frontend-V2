import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

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
  successMessage = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';
    this.success = false;
    this.successMessage = '';
    
    if (!this.email || !this.email.includes('@') || !this.email.includes('.')) {
      this.error = 'Veuillez entrer une adresse email valide';
      return;
    }
    
    this.loading = true;
    
    this.http.post<{success: boolean, message: string}>(
      `${environment.apiUrl}/auth/forgot-password`, 
      { email: this.email.trim() }
    ).subscribe({
      next: (response) => {
        this.loading = false;
        
        if (response.success) {
          this.success = true;
          this.successMessage = response.message;
          
          setTimeout(() => {
            this.success = false;
            this.email = '';
            this.successMessage = '';
          }, 8000);
        } else {
          this.error = response.message;
        }
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        
        if (error.status === 404) {
          this.error = 'Aucun compte associé à cette adresse email';
        } else if (error.status === 500) {
          this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
        } else if (error.status === 0) {
          this.error = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else {
          this.error = error.error?.message || 'Une erreur est survenue.';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}