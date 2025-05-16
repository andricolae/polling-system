import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { selectAuthLoading, selectAuthError } from './auth.selectors';
import { Store, select } from '@ngrx/store';
import { login } from './auth.actions';
import { RouterModule } from '@angular/router';

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
  errorMessage$: Observable<string | null>;
  loading$: Observable<boolean>;

  constructor(private store: Store) {
    this.errorMessage$ = this.store.pipe(select(selectAuthError));
    this.loading$ = this.store.select(selectAuthLoading);
  }

  login() {
    this.store.dispatch(login({ email: this.email, password: this.password }))
  }

}
