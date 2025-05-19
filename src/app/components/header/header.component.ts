import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../auth/auth.selectors';
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

  constructor(private router: Router, private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  menuOpen: boolean = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
    this.menuOpen = false;
  }

  logout() {
    this.store.dispatch(logout());
  }
}
