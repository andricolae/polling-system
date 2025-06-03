import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './pages/home/home.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard, emailVerifiedGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';

export const routes: Routes = [
  { path: 'login', component: AuthComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'user-dashboard', component: UserDashboardComponent },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  {
    path: 'vote',
    loadComponent: () => import('./pages/poll-vote/poll-vote.component')
      .then(m => m.PollVoteComponent),
    canActivate: [authGuard,emailVerifiedGuard] },
    canActivate: [authGuard]
  },
  {
    path: 'vote/:pollId',
    loadComponent: () => import('./pages/poll-vote/poll-vote.component')
      .then(m => m.PollVoteComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./pages/poll-create/poll-create.component')
      .then(m => m.PollCreateComponent),
    canActivate: [adminGuard]
  },
];
