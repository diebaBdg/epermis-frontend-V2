import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { LayoutComponent } from './layout/layout.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { RolesComponent } from './pages/roles/roles.component';
import { InspecteursComponent } from './pages/inspecteurs/inspecteurs.component';
import { CandidatsComponent } from './pages/candidats/candidats.component';
import { TypesPermisComponent } from './pages/types-permis/types-permis.component';
import { CategoriesEvaluationComponent } from './pages/categories-evaluation/categories-evaluation.component';
import { EvaluationsComponent } from './pages/evaluations/evaluations.component';
import { ForgotPasswordComponent } from './pages/login/forgot-password/forgot-password.component'; // À créer
import { ResetPasswordComponent } from './pages/login/reset-password/reset-password.component'; // À créer

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'reset-password/:token',
    component: ResetPasswordComponent
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'INSPECTEUR'] }
      },
      {
        path: 'roles',
        component: RolesComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] } 
      },
      {
        path: 'inspecteurs',
        component: InspecteursComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'candidats',
        component: CandidatsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'INSPECTEUR'] }
      },
      {
        path: 'types-permis',
        component: TypesPermisComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'INSPECTEUR'] } 
      },
      {
        path: 'categories-evaluation',
        component: CategoriesEvaluationComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'INSPECTEUR'] } 
      },
      {
        path: 'evaluations',
        component: EvaluationsComponent,
        canActivate: [RoleGuard],
        data: { roles: ['ADMIN', 'INSPECTEUR'] } 
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];