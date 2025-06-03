import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from '../../auth/auth.selectors';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  isAuthenticated$: Observable<boolean>;

  constructor(private router: Router, private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  handleGetStarted() {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/vote']);
      } else {
        this.router.navigate(['/login']);
      }
    }).unsubscribe();
  }

  handleStartPolling() {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/vote']);
      } else {
        this.router.navigate(['/login']);
      }
    }).unsubscribe();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  scrollToFeatures() {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}
