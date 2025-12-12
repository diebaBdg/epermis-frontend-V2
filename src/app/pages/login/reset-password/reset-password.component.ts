import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';
import { catchError, timeout } from 'rxjs/operators';
import { throwError, TimeoutError } from 'rxjs';

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
email: any;

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

    this.http.get(`${environment.apiUrl}/auth/validate-reset-token/${this.token}`)
      .pipe(
        timeout(10000),
        catchError((error: any) => {
          this.verifyingToken = false;
          this.tokenValid = false;
          
          // Vérification du timeout
          if (error instanceof TimeoutError) {
            this.error = 'La vérification a pris trop de temps. Veuillez réessayer.';
          } else if (error instanceof HttpErrorResponse) {
            // Gestion des erreurs HTTP
            if (error.status === 400) {
              this.error = 'Le lien de réinitialisation est invalide ou a expiré.';
            } else if (error.status === 0) {
              this.error = 'Impossible de contacter le serveur.';
            } else {
              this.error = error.error?.message || 'Erreur lors de la validation du token.';
            }
          } else {
            // Autres erreurs
            this.error = 'Erreur lors de la validation du token.';
          }

          setTimeout(() => {
            this.router.navigate(['/forgot-password']);
          }, 5000);
          
          return throwError(() => error);
        })
      )
      .subscribe({
        next: () => {
          this.verifyingToken = false;
          this.tokenValid = true;
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
    })
    .pipe(
      timeout(30000),
      catchError((error: any) => {
        this.loading = false;
        
        // Vérification du timeout
        if (error instanceof TimeoutError) {
          this.error = 'La requête a pris trop de temps. Veuillez réessayer.';
        } else if (error instanceof HttpErrorResponse) {
          // Gestion des erreurs HTTP
          if (error.status === 400) {
            this.error = error.error?.message || 'Le lien de réinitialisation est invalide ou a expiré.';
          } else if (error.status === 500) {
            this.error = 'Erreur du serveur. Veuillez réessayer plus tard.';
          } else if (error.status === 0) {
            this.error = 'Impossible de contacter le serveur.';
          } else {
            this.error = error.error?.message || 'Une erreur est survenue. Veuillez réessayer.';
          }
        } else {
          // Autres erreurs
          this.error = 'Une erreur est survenue. Veuillez réessayer.';
        }
        
        return throwError(() => error);
      })
    )
    .subscribe({
      next: () => {
        this.loading = false;
        this.success = true;

        this.newPassword = '';
        this.confirmPassword = '';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}