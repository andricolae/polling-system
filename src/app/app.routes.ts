import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';

export const routes: Routes = [
    {
        path: '', component: ComingSoonComponent
    },
    {
        path: 'login', component: AuthComponent
    }
];
