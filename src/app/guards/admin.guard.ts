import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../auth/auth.selectors';
import { map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectAuthUser).pipe(
    take(1),
    map(user => {
      if (user?.role === 'admin') {
        return true;
      } else {
        return false;
      }
    })
  );
};