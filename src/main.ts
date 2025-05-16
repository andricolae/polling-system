import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import{provideAuth, getAuth} from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent,{
  providers:[
    provideFirebaseApp(()=>initializeApp(environment.firebaseConfig)),
    provideAuth(()=>getAuth()),
    provideFirestore(()=>getFirestore()),
  ]

})
