import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollData, PollService, User } from '../../services/poll.service';

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  polls: PollData[] = [];
  users: User[] = [];

  constructor(private router: Router, private pollService: PollService) { }

  ngOnInit(): void {
    this.pollService.getActivePolls().subscribe(polls => {
      this.polls = polls;
    });

    this.pollService.getUsers().subscribe(users => {
      this.users = users;
    });
  }

  get totalVotes(): number {
    return this.polls.reduce((sum, poll) => {
      const pollVotes = poll.results?.reduce((a, b) => a + +b, 0) || 0;
      return sum + pollVotes;
    }, 0);
  }

  get recentPolls(): PollData[] {
    return [...this.polls]
      .sort((a, b) => b.created.getTime() - a.created.getTime())
      .slice(0, 5);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
