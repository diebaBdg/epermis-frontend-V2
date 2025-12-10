import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RolesComponent } from './pages/roles/roles.component';
import { InspecteursComponent } from './pages/inspecteurs/inspecteurs.component';
import { CandidatsComponent } from './pages/candidats/candidats.component';
import { TypesPermisComponent } from './pages/types-permis/types-permis.component';
import { CategoriesEvaluationComponent } from './pages/categories-evaluation/categories-evaluation.component';
import { EvaluationsComponent } from './pages/evaluations/evaluations.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'roles', component: RolesComponent },
      { path: 'inspecteurs', component: InspecteursComponent },
      { path: 'candidats', component: CandidatsComponent },
      { path: 'types-permis', component: TypesPermisComponent },
      { path: 'categories-evaluation', component: CategoriesEvaluationComponent },
      { path: 'evaluations', component: EvaluationsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
