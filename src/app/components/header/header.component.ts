import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { selectIsAuthenticated, selectAuthUser } from '../../auth/auth.selectors';
import { logout } from '../../auth/auth.actions';
import { NgIf } from '@angular/common';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-header',
  imports: [NgClass, NgIf, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  isAuthenticated$: Observable<boolean>;
  username$: Observable<string | null>;

  constructor(private router: Router, private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.username$ = this.store.select(selectAuthUser).pipe(
      map(user => {
        if (!user?.email) return null;
        const namePart = user.email.split('@')[0];
        return namePart.charAt(0).toUpperCase() + namePart.slice(1);
      })
    );
  }

  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(path: string) {
    if (path === '/') {
      const userData = localStorage.getItem('user');
      if (userData) {
        const { role } = JSON.parse(userData);
        if (role === 'admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (role === 'user') {
          this.router.navigate(['/user-dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate([path]);
    }

    this.menuOpen = false;
  }

  logout() {
    this.store.dispatch(logout());
  }

  showName() {
  }
}
