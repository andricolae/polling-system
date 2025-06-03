import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../auth/auth.selectors';
import { map, take } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { initializeAuth } from '../auth/auth.actions';

export const adminGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return store.select(selectAuthUser).pipe(
    take(1),
    map(user => {
      if (user?.role === 'admin') {
        return true;
      }

      if (isPlatformBrowser(platformId)) {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser);
            if (userData?.uid && userData?.email) {
              store.dispatch(initializeAuth({ user: userData }));

              if (userData.role === 'admin') {
                return true;
              }
            }
          } catch (e) {
            console.error('Error reading user from localStorage in admin guard', e);
          }
        }
      }

      router.navigate(['/login']);
      return false;
    })
  );
};
