import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [NgFor, NgIf, DatePipe],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent {
  activePolls = [
    {
      title: 'Best JS Framework',
      description: 'Vote for your favorite frontend framework',
      hasVoted: true
    },
    {
      title: 'Add dark mode?',
      description: 'Do you want this app to support dark mode?',
      hasVoted: false
    }
  ];

  votedPolls = [
    {
      title: 'UI Feedback',
      voteDate: new Date('2025-05-15')
    }
  ];

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
