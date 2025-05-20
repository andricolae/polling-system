import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { selectAuthLoading, selectAuthError } from './auth.selectors';
import { Store, select } from '@ngrx/store';
import { login } from './auth.actions';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { signup, clearAuthError,loginFailure } from './auth.actions';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css'
})
export class AuthComponent {

  email = '';
  password = '';
  confirmPassword = '';
  isSignupMode = false;
  errorMessage$: Observable<string | null>;
  loading$: Observable<boolean>;

  constructor(private authService: AuthService, private store: Store) {
    this.errorMessage$ = this.store.pipe(select(selectAuthError));
    this.loading$ = this.store.select(selectAuthLoading);
  }

  login() {
    this.store.dispatch(login({ email: this.email, password: this.password }))
  }

  signup() {
    if (this.password !== this.confirmPassword) {
      this.store.dispatch(loginFailure({ error: 'Passwords do not match.' }));
      return;
    }
    this.store.dispatch(signup({ email: this.email, password: this.password }));
  }

  switchToSignup() {
    this.store.dispatch(clearAuthError());
    this.isSignupMode = true;
  }

  switchToLogin() {
    this.store.dispatch(clearAuthError());
    this.isSignupMode = false;
  }

}
