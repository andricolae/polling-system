import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-user-dashboard',
  imports: [NgFor, NgIf, DatePipe, AsyncPipe],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit {

  activePolls$!: Observable<any[]>;
  votedPolls$!: Observable<any[]>;

  constructor(private pollService: PollService, private router: Router) { }


  ngOnInit() {
    const userId = this.pollService.getCurrentUserId();
    if (!userId) return;

    this.activePolls$ = this.pollService.getActivePolls().pipe(
      map(polls => polls
        .filter(p => p.voters.includes(userId))
        .map(p => ({
          title: p.title,
          description: p.description,
          hasVoted: p.voted.includes(userId)
        }))
      )
    );

    this.votedPolls$ = this.pollService.getPastPolls().pipe(
      map(polls => polls
        .filter(p => p.voted.includes(userId))
        .map(p => ({
          title: p.title,
          voteDate: p.deadline
        }))
      )
    );
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
