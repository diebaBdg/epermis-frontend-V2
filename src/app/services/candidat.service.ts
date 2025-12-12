import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { Candidat, CreateCandidatRequest } from '../models/candidat.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CandidatService {
  private apiUrl = `${environment.apiUrl}/candidats`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // Méthode intelligente qui filtre selon le rôle
  getCandidats(filters?: any): Observable<Candidat[]> {
    const user = this.authService.getCurrentUser();
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }

    // Si inspecteur, ajouter automatiquement le filtre sur son matricule
    if (user?.role === 'INSPECTEUR' && user?.matricule) {
      params = params.set('inspecteurMatricule', user.matricule);
    }

    return this.http.get<Candidat[]>(this.apiUrl, { 
      params,
      headers: this.getAuthHeaders()
    });
  }

  getCandidatById(id: string): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createCandidat(candidat: CreateCandidatRequest): Observable<Candidat> {
    return this.http.post<Candidat>(this.apiUrl, candidat, {
      headers: this.getAuthHeaders()
    });
  }

  updateCandidat(id: string, candidat: any): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.apiUrl}/${id}`, candidat, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCandidat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  getCandidatsSansInspecteur(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(`${this.apiUrl}/sans-inspecteur`, {
      headers: this.getAuthHeaders()
    });
  }

  assignerInspecteur(candidatId: string, inspecteurMatricule: string): Observable<Candidat> {
    return this.http.post<Candidat>(
      `${this.apiUrl}/${candidatId}/assigner-inspecteur/${inspecteurMatricule}`, 
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  retirerInspecteur(candidatId: string): Observable<Candidat> {
    return this.http.post<Candidat>(
      `${this.apiUrl}/${candidatId}/retirer-inspecteur`, 
      {},
      { headers: this.getAuthHeaders() }
    );
  }

  // Statistiques intelligentes selon le rôle
  getStats(inspecteurMatricule?: string): Observable<any> {
    const user = this.authService.getCurrentUser();
    let params = new HttpParams();
    
    // Si inspecteur, utiliser son matricule
    if (user?.role === 'INSPECTEUR' && user?.matricule) {
      params = params.set('inspecteurMatricule', user.matricule);
    } else if (inspecteurMatricule) {
      params = params.set('inspecteurMatricule', inspecteurMatricule);
    }
    
    return this.http.get<any>(`${this.apiUrl}/stats`, { 
      params,
      headers: this.getAuthHeaders()
    });
  }
}