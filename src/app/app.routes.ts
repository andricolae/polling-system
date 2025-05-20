import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PollVoteComponent } from './pages/poll-vote/poll-vote.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    // { path: '', component: ComingSoonComponent },
    { path: 'login', component: AuthComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'vote', loadComponent: () => import('./pages/poll-vote/poll-vote.component').then(m => m.PollVoteComponent), canActivate: [authGuard] },
    { path: 'create', loadComponent: () => import('./pages/poll-create/poll-create.component').then(m => m.PollCreateComponent), canActivate: [adminGuard] },
];
