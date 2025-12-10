import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Evaluation, CategorieEvaluationPermis } from '../models/evaluation.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;
  private categoriesUrl = `${environment.apiUrl}/categorie-evaluation-permis`;

  constructor(private http: HttpClient) {}

  getEvaluations(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<any>(this.apiUrl, { params });
  }

  getEvaluationById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`);
  }

  getMesEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/mes-evaluations`);
  }

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`);
  }

  getMesStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/mes-stats`);
  }

  getCategories(): Observable<CategorieEvaluationPermis[]> {
    return this.http.get<CategorieEvaluationPermis[]>(this.categoriesUrl);
  }

  getCategoriesByTypePermis(typePermis: string): Observable<CategorieEvaluationPermis[]> {
    return this.http.get<CategorieEvaluationPermis[]>(`${this.categoriesUrl}/allBy/${typePermis}`);
  }

  createCategorie(categorie: any): Observable<CategorieEvaluationPermis> {
    return this.http.post<CategorieEvaluationPermis>(this.categoriesUrl, categorie);
  }

  updateCategorie(id: string, categorie: any): Observable<CategorieEvaluationPermis> {
    return this.http.put<CategorieEvaluationPermis>(`${this.categoriesUrl}/${id}`, categorie);
  }

  deleteCategorie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`);
  }
}
