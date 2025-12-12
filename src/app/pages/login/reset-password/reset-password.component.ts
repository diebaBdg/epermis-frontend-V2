import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  login: string = '';
  oldPassword: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  loading = false;
  verifyingUser = false;
  error = '';
  success = false;
  userExists = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.login = this.route.snapshot.paramMap.get('login') || '';
    
    // Vérifier si l'utilisateur existe quand la page charge
    if (this.login) {
      this.verifyUserExists();
    } else {
      this.error = 'Identifiant manquant';
      setTimeout(() => {
        this.router.navigate(['/forgot-password']);
      }, 3000);
    }
  }

  verifyUserExists(): void {
    this.verifyingUser = true;
    
    this.http.post<{valid: boolean}>(`${environment.apiUrl}/auth/verify-password/${this.login}`, {
      password: 'temp_check' // Mot de passe temporaire pour vérifier l'existence
    }).subscribe({
      next: (response) => {
        this.verifyingUser = false;
        // Si on arrive ici, l'utilisateur existe (même si le mot de passe est faux)
        this.userExists = true;
      },
      error: (err) => {
        this.verifyingUser = false;
        
        if (err.status === 404) {
          this.userExists = false;
          this.error = 'Utilisateur non trouvé. Veuillez vérifier votre identifiant.';
          
          setTimeout(() => {
            this.router.navigate(['/forgot-password']);
          }, 3000);
        } else {
          // Pour d'autres erreurs, on continue quand même
          this.userExists = true;
        }
      }
    });
  }

  // Reste du code inchangé...
  togglePasswordVisibility(field: string): void {
    switch (field) {
      case 'old':
        this.showOldPassword = !this.showOldPassword;
        break;
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
    // Vérifier d'abord si l'utilisateur existe
    if (!this.userExists) {
      this.error = 'Utilisateur non trouvé. Veuillez vérifier votre identifiant.';
      return;
    }

    // Validation
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Les nouveaux mots de passe ne correspondent pas';
      return;
    }

    const passwordValidation = this.validatePassword(this.newPassword);
    if (!passwordValidation.valid) {
      this.error = passwordValidation.message;
      return;
    }

    if (this.oldPassword === this.newPassword) {
      this.error = 'Le nouveau mot de passe doit être différent de l\'ancien';
      return;
    }

    this.loading = true;
    this.error = '';

    // Appel à l'API pour changer le mot de passe
    this.http.post(`${environment.apiUrl}/auth/change-password/${this.login}`, {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        
        // Effacer les mots de passe pour la sécurité
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        
        // Redirection vers la page de connexion après 3 secondes
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 401) {
          this.error = 'Ancien mot de passe incorrect';
        } else if (err.status === 404) {
          this.error = 'Utilisateur non trouvé';
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