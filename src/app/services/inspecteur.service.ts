import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class InspecteurService {
  private apiUrl = `${environment.apiUrl}/inspecteurs`;
  private usersUrl = `${environment.apiUrl}/users`;

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
  
  createUser(userData: any): Observable<User> {
    return this.http.post<User>(this.usersUrl, userData);
  }

  updateUser(id: string, userData: any): Observable<User> {
    return this.http.put<User>(`${this.usersUrl}/${id}`, userData);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.usersUrl}/${id}`);
  }

  getUsersByRole(role: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/by-role/${role}`);
  }

  // Méthode spécifique pour créer un inspecteur
  createInspecteurComplet(data: any): Observable<User> {
    const inspecteurData = {
      ...data,
      role: 'INSPECTEUR',
      statut: 'ACTIF'
    };
    return this.createUser(inspecteurData);
  }
}
