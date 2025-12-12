// email.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ResetPasswordRequest {
  login: string;
  email: string;
  resetToken?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  
  constructor(private http: HttpClient) {}

  // Méthode pour envoyer un email de réinitialisation
  sendResetPasswordEmail(request: ResetPasswordRequest): Observable<any> {
    // Si votre API a un endpoint pour envoyer des emails
    // return this.http.post(`${environment.apiUrl}/auth/send-reset-email`, request);
    
    // Pour l'instant, simulons l'envoi
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, message: 'Email envoyé avec succès' });
        observer.complete();
      }, 1000);
    });
  }

  // Méthode pour vérifier un token de réinitialisation
  verifyResetToken(login: string, token: string): Observable<any> {
    // return this.http.post(`${environment.apiUrl}/auth/verify-reset-token`, { login, token });
    
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ valid: true });
        observer.complete();
      }, 1000);
    });
  }
}