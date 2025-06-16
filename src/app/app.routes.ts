import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { HomeComponent } from './pages/home/home.component';
import { adminGuard } from './guards/admin.guard';
import { authGuard, emailVerifiedGuard } from './guards/auth.guard';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './pages/user-dashboard/user-dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AllPollsComponent } from './pages/all-polls/all-polls.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: AuthComponent },

  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [authGuard, adminGuard]
  },
  {
    path: 'user-dashboard',
    component: UserDashboardComponent,
    canActivate: [authGuard, emailVerifiedGuard]
  },
  {
    path: 'all-polls',
    component: AllPollsComponent,
    canActivate: []
  },
  {
    path: 'vote',
    loadComponent: () =>
      import('./pages/poll-vote/poll-vote.component').then(m => m.PollVoteComponent),
    canActivate: [authGuard, emailVerifiedGuard]
  },
  {
    path: 'vote/:pollId',
    loadComponent: () =>
      import('./pages/poll-vote/poll-vote.component').then(m => m.PollVoteComponent),
    canActivate: [authGuard, emailVerifiedGuard]
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/poll-create/poll-create.component').then(m => m.PollCreateComponent),
    canActivate: [authGuard, adminGuard]
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: 'poll/:id',
    loadComponent: () =>
      import('./pages/single-poll/single-poll.component').then(m => m.SinglePollComponent)
  }
];
