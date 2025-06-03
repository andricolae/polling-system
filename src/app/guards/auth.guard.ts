import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated, selectAuthUser } from '../auth/auth.selectors';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
    const store = inject(Store);

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