import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Evaluation, CategorieEvaluationPermis, EvaluationStats } from '../models/evaluation.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService {
  private apiUrl = `${environment.apiUrl}/evaluations`;
  private categoriesUrl = `${environment.apiUrl}/categorie-evaluation-permis`;
  usersUrl: any;
  inspecteursCache: any;

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


  private loadInspecteurs(): Observable<User[]> {
    return this.http.get<User[]>(`${this.usersUrl}/by-role/INSPECTEUR`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(inspecteurs => {
        this.inspecteursCache.clear();
        inspecteurs.forEach((inspecteur: { matricule: any; }) => {
          this.inspecteursCache.set(inspecteur.matricule, inspecteur);
        });
      })
    );
  }

  getInspecteurInfo(matricule: string): Observable<User | undefined> {

    const cached = this.inspecteursCache.get(matricule);
    if (cached) {
      return of(cached);
    }
    
    return this.loadInspecteurs().pipe(
      map(() => this.inspecteursCache.get(matricule))
    );
  }

  getInspecteurDisplay(matricule: string): Observable<string> {
    return this.getInspecteurInfo(matricule).pipe(
      map(inspecteur => {
        if (inspecteur) {
          return `${inspecteur.prenom} ${inspecteur.nom} (${matricule})`;
        }
        return matricule;
      }),
      catchError(() => of(matricule))
    );
  }

  getEvaluations(): Observable<Evaluation[]> {
    const user = this.authService.getCurrentUser();
    
    if (user?.role === 'ADMIN') {
      // Admin voit toutes les évaluations
      return this.getAllEvaluations();
    } else if (user?.role === 'INSPECTEUR') {
      // Inspecteur ne voit que ses évaluations
      return this.getMesEvaluations();
    } else {
      // Par défaut, on retourne un tableau vide
      return of([]);
    }
  }

  // Admin: toutes les évaluations
  getAllEvaluations(page: number = 0, size: number = 10, sortBy?: string, sortDirection?: string): Observable<Evaluation[]> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }
    
    if (sortDirection) {
      params = params.set('sortDirection', sortDirection);
    }

    return this.http.get<Evaluation[]>(this.apiUrl, { 
      params,
      headers: this.getAuthHeaders() 
    });
  }

  // Inspecteur: ses évaluations seulement
  getMesEvaluations(): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/mes-evaluations`, {
      headers: this.getAuthHeaders()
    });
  }

  // Méthode intelligente pour les statistiques
  getStats(): Observable<EvaluationStats> {
    const user = this.authService.getCurrentUser();
    
    if (user?.role === 'ADMIN') {
      // Admin: statistiques globales
      return this.getGlobalStats();
    } else if (user?.role === 'INSPECTEUR') {
      // Inspecteur: ses statistiques
      return this.getMesStats();
    } else {
      // Par défaut, retourne des stats vides
      return new Observable<EvaluationStats>(observer => {
        observer.next({
          totalEvaluations: 0,
          admis: 0,
          ajoure: 0,
          tauxReussite: 0,
          tauxEchec: 0
        });
        observer.complete();
      });
    }
  }

  // Statistiques globales (Admin)
  getGlobalStats(): Observable<EvaluationStats> {
    return this.http.get<EvaluationStats>(`${this.apiUrl}/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  // Mes statistiques (Inspecteur)
  getMesStats(): Observable<EvaluationStats> {
    return this.http.get<EvaluationStats>(`${this.apiUrl}/mes-stats`, {
      headers: this.getAuthHeaders()
    });
  }

  // Statistiques par inspecteur (Admin)
  getStatsByInspecteur(inspecteurMatricule: string): Observable<EvaluationStats> {
    return this.http.get<EvaluationStats>(`${this.apiUrl}/inspecteur/${inspecteurMatricule}/stats`, {
      headers: this.getAuthHeaders()
    });
  }

  // Évaluations par inspecteur (Admin)
  getEvaluationsByInspecteur(inspecteurMatricule: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/inspecteur/${inspecteurMatricule}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Évaluations par type de permis
  getEvaluationsByTypePermis(codeTypePermis: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/type-permis/${codeTypePermis}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Évaluations par candidat
  getEvaluationsByCandidat(numeroDossierCandidat: string): Observable<Evaluation[]> {
    return this.http.get<Evaluation[]>(`${this.apiUrl}/candidat/${numeroDossierCandidat}`, {
      headers: this.getAuthHeaders()
    });
  }

  getEvaluationById(id: string): Observable<Evaluation> {
    return this.http.get<Evaluation>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  createEvaluation(evaluationData: any): Observable<Evaluation> {
    return this.http.post<Evaluation>(this.apiUrl, evaluationData, {
      headers: this.getAuthHeaders()
    });
  }

  updateEvaluation(id: string, evaluationData: any): Observable<Evaluation> {
    return this.http.put<Evaluation>(`${this.apiUrl}/${id}`, evaluationData, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEvaluation(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // Gestion des catégories
  getCategories(): Observable<CategorieEvaluationPermis[]> {
    return this.http.get<CategorieEvaluationPermis[]>(this.categoriesUrl, {
      headers: this.getAuthHeaders()
    });
  }

  getCategoriesByTypePermis(typePermis: string): Observable<CategorieEvaluationPermis[]> {
    return this.http.get<CategorieEvaluationPermis[]>(`${this.categoriesUrl}/allBy/${typePermis}`, {
      headers: this.getAuthHeaders()
    });
  }

  createCategorie(categorie: any): Observable<CategorieEvaluationPermis> {
    return this.http.post<CategorieEvaluationPermis>(this.categoriesUrl, categorie, {
      headers: this.getAuthHeaders()
    });
  }

  updateCategorie(id: string, categorie: any): Observable<CategorieEvaluationPermis> {
    return this.http.put<CategorieEvaluationPermis>(`${this.categoriesUrl}/${id}`, categorie, {
      headers: this.getAuthHeaders()
    });
  }

  deleteCategorie(id: string): Observable<void> {
    return this.http.delete<void>(`${this.categoriesUrl}/${id}`, {
      headers: this.getAuthHeaders()
    });
  }
}
