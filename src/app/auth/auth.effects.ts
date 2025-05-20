import { Injectable, inject } from "@angular/core";
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { logout, logoutSuccess, login, loginSuccess, loginFailure, clearAuthError } from './auth.actions';
import { exhaustMap, switchMap, map, catchError, tap, delay } from 'rxjs/operators';
import { of, from } from 'rxjs';
import { Auth, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { signup } from "./auth.actions";
import { createUserWithEmailAndPassword } from "@angular/fire/auth";

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ email, password }) =>
        from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
          switchMap(userCredential => {
            const uid = userCredential.user.uid;
            const email = userCredential.user.email ?? '';
            const userRef = doc(this.firestore, `users/${uid}`);

            return from(getDoc(userRef)).pipe(
              map(userDoc => {
                const role = userDoc.data()?.['role'] ?? 'user';
                return loginSuccess({
                  user: { uid, email, role }
                });
              })
            );
          }),
          catchError(error => {
            const code = error.code || '';
            let userMessage = 'Authentication failed.';

            switch (code) {
              case 'auth/user-not-found':
                userMessage = 'No account found with this email.';
                break;
              case 'INVALID_LOGIN_CREDENTIALS':
                userMessage = 'Invalid email or password.';
                break;
              case 'auth/invalid-password':
                userMessage = 'Incorrect password.';
                break;
              case 'auth/invalid-email':
                userMessage = 'The email address is not valid.';
                break;
              case 'auth/weak-password':
                userMessage = 'Password should be at least 6 characters.';
                break;
              case 'auth/too-many-requests':
                userMessage = 'Too many attempts. Try again later.';
                break;
            }
            return of(loginFailure({ error: userMessage }));
          })
        )
      )
    )
  );

  redirectAfterLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loginSuccess),
      tap(({ user }) => {
        switch (user.role) {
          case 'admin':
            this.router.navigate(['/create']);
            break;
          case 'user':
            this.router.navigate(['/vote']);
            break;
          default:
            this.router.navigate(['/home']);
        }
      })
    ),
    { dispatch: false }
  );

  signup$ = createEffect(() =>
    this.actions$.pipe(
      ofType(signup),
      exhaustMap(({ email, password }) =>
        from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
          switchMap(userCredential => {
            const uid = userCredential.user.uid;
            const email = userCredential.user.email ?? '';
            const userRef = doc(this.firestore, `users/${uid}`);
            return from(setDoc(userRef, { role: 'user', email })).pipe(
              map(() => loginSuccess({ user: { uid, email, role: 'user' } }))
            );
          }),
          catchError(error => {
            const code = error.code || '';
            let userMessage = 'Signup failed.';

            switch (code) {
              case 'auth/email-already-in-use':
                userMessage = 'This email is already in use.';
                break;
              case 'auth/invalid-email':
                userMessage = 'The email address is not valid.';
                break;
              case 'auth/weak-password':
                userMessage = 'Password should be at least 6 characters.';
                break;
              case 'auth/operation-not-allowed':
                userMessage = 'Signup is currently disabled.';
                break;
              default:
                userMessage = 'Something went wrong. Try again.';
            }

            return of(loginFailure({ error: userMessage }));
          })
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() =>
        from(signOut(this.auth)).pipe(
          tap(() => this.router.navigate(['/login'])),
          map(() => logoutSuccess()),
          catchError(() => of(logoutSuccess()))
        )
      )
    )
  );

  clearErrorAfterDelay$ = createEffect(() =>
    this.actions$.pipe(ofType(loginFailure), switchMap(() => of(clearAuthError()).pipe(delay(3000))))
  );

}
