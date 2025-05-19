import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { environment } from './environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideStore } from '@ngrx/store';
import { AuthEffects } from './app/auth/auth.effects';
import { provideEffects } from '@ngrx/effects';
import { authReducer } from './app/auth/auth.reducer';

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideRouter(routes),
    provideStore({ auth: authReducer }),
    provideEffects([AuthEffects]),
  ]

})
