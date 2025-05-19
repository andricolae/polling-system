import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { ComingSoonComponent } from './coming-soon/coming-soon.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { UserDashboardComponent } from './user-dashboard/user-dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { PollCreateComponent } from './pages/poll-create/poll-create.component';
import { PollVoteComponent } from './pages/poll-vote/poll-vote.component';

export const routes: Routes = [
    { path: '', component: ComingSoonComponent },
    { path: 'login', component: AuthComponent },
    { path: 'admin-dashboard', component: AdminDashboardComponent },
    { path: 'user-dashboard', component: UserDashboardComponent },
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'create', component: PollCreateComponent },
    { path: 'vote', component: PollVoteComponent }
];
