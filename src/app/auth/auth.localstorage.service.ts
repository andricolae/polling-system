import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Store } from '@ngrx/store';
import { initializeAuth, loginSuccess } from './auth.actions';

@Injectable({
    providedIn: 'root'
})
export class AuthInitializerService {
    constructor(private store: Store) {
        const platformId = inject(PLATFORM_ID);

        if (isPlatformBrowser(platformId)) {
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    if (user?.uid && user?.email) {
                        this.store.dispatch(initializeAuth({ user }));
                    }
                } catch (e) {
                    console.error('Eroare la citirea user-ului din localStorage', e);
                }
            }
        }
    }
}
