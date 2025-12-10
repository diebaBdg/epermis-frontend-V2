import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Candidat, CreateCandidatRequest } from '../models/candidat.model';

@Injectable({
  providedIn: 'root'
})
export class CandidatService {
  private apiUrl = `${environment.apiUrl}/candidats`;

  constructor(private http: HttpClient) {}

  getCandidats(filters?: any): Observable<Candidat[]> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key] !== null && filters[key] !== undefined) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get<Candidat[]>(this.apiUrl, { params });
  }

  getCandidatById(id: string): Observable<Candidat> {
    return this.http.get<Candidat>(`${this.apiUrl}/${id}`);
  }

  createCandidat(candidat: CreateCandidatRequest): Observable<Candidat> {
    return this.http.post<Candidat>(this.apiUrl, candidat);
  }

  updateCandidat(id: string, candidat: any): Observable<Candidat> {
    return this.http.put<Candidat>(`${this.apiUrl}/${id}`, candidat);
  }

  deleteCandidat(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCandidatsSansInspecteur(): Observable<Candidat[]> {
    return this.http.get<Candidat[]>(`${this.apiUrl}/sans-inspecteur`);
  }

  assignerInspecteur(candidatId: string, inspecteurMatricule: string): Observable<Candidat> {
    return this.http.post<Candidat>(`${this.apiUrl}/${candidatId}/assigner-inspecteur/${inspecteurMatricule}`, {});
  }

  retirerInspecteur(candidatId: string): Observable<Candidat> {
    return this.http.post<Candidat>(`${this.apiUrl}/${candidatId}/retirer-inspecteur`, {});
  }

  getStats(inspecteurMatricule?: string): Observable<any> {
    let params = new HttpParams();
    if (inspecteurMatricule) {
      params = params.set('inspecteurMatricule', inspecteurMatricule);
    }
    return this.http.get<any>(`${this.apiUrl}/stats`, { params });
  }
}
