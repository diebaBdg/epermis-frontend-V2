import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class InspecteurService {
  private apiUrl = `${environment.apiUrl}/inspecteurs`;

  constructor(private http: HttpClient) {}

  getInspecteurs(): Observable<User[]> {
    return this.http.get<User[]>(this.apiUrl);
  }

  getInspecteursDisponibles(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/disponibles`);
  }

  getDashboard(matricule: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${matricule}/dashboard`);
  }

  getPlanningDuJour(matricule: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${matricule}/planning-du-jour`);
  }

  getPerformances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/performances`);
  }
}
