import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TypePermis, CreateTypePermisRequest } from '../models/type-permis.model';

@Injectable({
  providedIn: 'root'
})
export class TypePermisService {
  private apiUrl = `${environment.apiUrl}/types-permis`;

  constructor(private http: HttpClient) {}

  getTypesPermis(): Observable<TypePermis[]> {
    return this.http.get<TypePermis[]>(this.apiUrl);
  }

  getTypePermisById(id: string): Observable<TypePermis> {
    return this.http.get<TypePermis>(`${this.apiUrl}/${id}`);
  }

  createTypePermis(typePermis: CreateTypePermisRequest): Observable<TypePermis> {
    return this.http.post<TypePermis>(this.apiUrl, typePermis);
  }

  updateTypePermis(id: string, typePermis: any): Observable<TypePermis> {
    return this.http.put<TypePermis>(`${this.apiUrl}/${id}`, typePermis);
  }

  deleteTypePermis(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
