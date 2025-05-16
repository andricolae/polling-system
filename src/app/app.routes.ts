import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';

export const routes: Routes = [
    { path: '', component: ComingSoonComponent },
    { path: 'login', component: AuthComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
];
