import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { environment } from './environment';

bootstrapApplication(AppComponent,{
  providers:[
    //provideFirebaseApp(()=>initializeApp(environment.firebaseConfig)),
  ]

})
