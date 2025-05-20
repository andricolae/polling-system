import { inject } from '@angular/core';
import { CanActivateFn} from '@angular/router';
import { Store } from '@ngrx/store';
import { selectIsAuthenticated } from '../auth/auth.selectors';
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