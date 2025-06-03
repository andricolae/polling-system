import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectAuthUser } from '../auth/auth.selectors';
import { map, take } from 'rxjs/operators';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../auth/auth.selectors';
import { catchError, filter, map, take, timeout } from 'rxjs/operators';
import { of } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

    return store.select(selectIsAuthenticated).pipe(
        take(1),
        map(isAuth => {
            if (isAuth) {
                return true;
            } else {
                return false;
            }
        })
    );
};

export const emailVerifiedGuard: CanActivateFn = () => {
    const store = inject(Store);

    return store.select(selectAuthUser).pipe(
        take(1),
        map(user => {
            if (user?.emailVerified) {
                return true;
            } else {
                return false;
            }
        })
    );
};
  return store.select(selectIsAuthenticated).pipe(
    filter(isAuth => isAuth !== null && isAuth !== undefined),
    take(1),
    timeout(5000),
    map(isAuth => {
      if (isAuth) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    }),
    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    })
  );
};
