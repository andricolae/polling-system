import { Injectable, inject } from "@angular/core";
import { createEffect, Actions, ofType } from '@ngrx/effects';
import { logout, logoutSuccess, login, loginSuccess, loginFailure } from './auth.actions';
import { exhaustMap, switchMap, map, catchError, tap } from 'rxjs/operators';
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
          catchError(error => of(loginFailure({ error: error.message })))
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
          catchError(error => of(loginFailure({ error: error.message })))
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
}
