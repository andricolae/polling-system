import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { PollCreateComponent } from './pages/poll-create/poll-create.component';
import { PollVoteComponent } from './pages/poll-vote/poll-vote.component';
export const routes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'home', component: HomeComponent },
    { path: 'create', component: PollCreateComponent },
    { path: 'vote', component: PollVoteComponent }
];
