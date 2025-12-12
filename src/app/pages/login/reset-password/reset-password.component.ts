import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  verifyingToken = false;
  error = '';
  success = false;
  tokenValid = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    if (this.token) {
      this.verifyToken();
    } else {
      this.error = 'Token manquant';
      setTimeout(() => {
        this.router.navigate(['/forgot-password']);
      }, 3000);
    }
  }

  verifyToken(): void {
    this.verifyingToken = true;

    this.http.get(`${environment.apiUrl}/auth/validate-reset-token/${this.token}`).subscribe({
      next: () => {
        this.verifyingToken = false;
        this.tokenValid = true;
      },
      error: (err) => {
        this.verifyingToken = false;
        this.tokenValid = false;
        if (err.status === 400) {
          this.error = 'Le lien de réinitialisation est invalide ou a expiré.';
        } else {
          this.error = 'Erreur lors de la validation du token.';
        }

        setTimeout(() => {
          this.router.navigate(['/forgot-password']);
        }, 5000);
      }
    });
  }

  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'new':
        this.showNewPassword = !this.showNewPassword;
        break;
      case 'confirm':
        this.showConfirmPassword = !this.showConfirmPassword;
        break;
    }
  }

  validatePassword(password: string): { valid: boolean; message: string } {
    if (password.length < 8) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!/[A-Z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    if (!/[a-z]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial' };
    }
    return { valid: true, message: '' };
  }

  onSubmit(): void {
    if (!this.tokenValid) {
      this.error = 'Token invalide. Veuillez recommencer la procédure.';
      return;
    }

    if (!this.newPassword || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    const passwordValidation = this.validatePassword(this.newPassword);
    if (!passwordValidation.valid) {
      this.error = passwordValidation.message;
      return;
    }

    this.loading = true;
    this.error = '';

    this.http.post(`${environment.apiUrl}/auth/reset-password`, {
      token: this.token,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        this.newPassword = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 400) {
          this.error = 'Le lien de réinitialisation est invalide ou a expiré.';
        } else {
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}