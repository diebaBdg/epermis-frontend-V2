import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    const requiredRoles = route.data['roles'] as string[];
    
    if (requiredRoles && !requiredRoles.includes(currentUser.role)) {
      // Rediriger vers le dashboard si l'utilisateur n'a pas le bon rôle
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}