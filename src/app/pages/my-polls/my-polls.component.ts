import { Component, OnInit } from '@angular/core';
import { PollData, PollService } from '../../services/poll.service';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-my-polls',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe],
  templateUrl: './my-polls.component.html',
  styleUrl: './my-polls.component.css'
})
export class MyPollsComponent implements OnInit {
  polls: PollData[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';
  userId: string | null = null;

  constructor(private pollService: PollService) { }

  ngOnInit(): void {
    this.userId = this.pollService.getCurrentUserId();
    if (!this.userId) {
      this.errorMessage = 'User not authenticated';
      return;
    }

    this.loading = true;
    this.pollService.getAllPolls().subscribe({
      next: (polls) => {
        this.polls = polls
          .filter(p => p.createdBy === this.userId)
          .map(p => ({
            ...p,
            startTime: this.ensureDate(p.startTime),
            deadline: this.ensureDate(p.deadline)
          }));

        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load your polls.';
      }
    });
  }

  deletePoll(pollId: string) {
    if (!pollId) return;
    this.pollService.deletePoll(pollId)
      .then(() => {
        console.log('Poll deleted successfully.');
      })
      .catch(error => {
        console.error('Error deleting poll:', error);
      });

  }

  private ensureDate(value: any): Date {
    if (value instanceof Date) return value;
    if (value?.toDate) return value.toDate();
    if (value?.seconds) return new Date(value.seconds * 1000);
    return new Date(value); // fallback for ISO strings
  }

  isPending(p: PollData): boolean {
    const now = new Date();
    return p.startTime > now;
  }

  isActive(p: PollData): boolean {
    const now = new Date();
    return p.startTime <= now && p.deadline >= now && p.isActive;
  }

  isClosed(p: PollData): boolean {
    const now = new Date();
    return p.deadline < now || !p.isActive;
  }

  get pendingPolls(): PollData[] {
    return this.polls.filter(p => this.isPending(p));
  }

  get activePolls(): PollData[] {
    return this.polls.filter(p => this.isActive(p));
  }

  get closedPolls(): PollData[] {
    return this.polls.filter(p => this.isClosed(p));
  }
}
