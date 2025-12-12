import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment.prod';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  login: string = '';
  loading = false;
  error = '';
  success = false;
  userExists = false;
  userEmail: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  checkUserExists(): void {
    if (!this.login.trim()) {
      this.error = 'Veuillez entrer votre identifiant (email ou matricule)';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;
    this.userExists = false;
    this.userEmail = '';

    this.http.get(`${environment.apiUrl}/users/check-existence/${this.login}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        if (response.exists) {
          this.userExists = true;
          this.userEmail = response.email || 'votre email';
          this.success = true;
          
          setTimeout(() => {
            this.router.navigate(['/reset-password', this.login]);
          }, 3000);
        } else {
          this.error = 'Utilisateur non trouvé. Vérifiez votre identifiant.';
        }
      },
      error: (err) => {
        this.loading = false;
        
        if (err.status === 404) {
          this.error = 'Service temporairement indisponible. Redirection...';
          setTimeout(() => {
            this.router.navigate(['/reset-password', this.login]);
          }, 2000);
        } else {
          this.success = true;
          setTimeout(() => {
            this.router.navigate(['/reset-password', this.login]);
          }, 2000);
        }
      }
    });
  }

  

  onSubmit(): void {
    if (!this.login.trim()) {
      this.error = 'Veuillez entrer votre identifiant (email ou matricule)';
      return;
    }

    this.loading = true;
    this.error = '';
    this.success = false;

    // TODO une verification
    setTimeout(() => {
      this.loading = false;
      this.success = true;
      
      setTimeout(() => {
        this.router.navigate(['/reset-password', this.login]);
      }, 2000);
    }, 1500);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}