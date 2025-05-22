import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PollService, PollData } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PieChartComponent } from "../../components/pie-chart/pie-chart.component";

@Component({
  selector: 'app-poll-vote',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule, PieChartComponent],
  templateUrl: './poll-vote.component.html',
  styleUrl: './poll-vote.component.css'
})
export class PollVoteComponent implements OnInit {
  ongoingPolls: PollData[] = [];
  pastPolls: PollData[] = [];
  selectedPoll: PollData | null = null;

  loading = false;
  selectedAnswer: string = '';
  hasVoted: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  currentUserId: string | null = null;

  constructor(private pollService: PollService, private router: Router) { }

  ngOnInit() {
    this.currentUserId = this.pollService.getCurrentUserId();
    this.loadPolls();

  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  loadPolls() {
    this.loading = true;
    this.errorMessage = null;

    this.pollService.getActivePolls().subscribe({
      next: (polls) => {
        this.ongoingPolls = this.filterPollsForCurrentUser(polls);
        console.log('Active polls loaded for current user:', this.ongoingPolls.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading active polls:', error);
        this.errorMessage = 'Could not load active polls';
        this.loading = false;
      }
    });

    this.pollService.getPastPolls().subscribe({
      next: (polls) => {
        this.pastPolls = this.filterPollsForCurrentUser(polls);
        console.log('Past polls loaded for current user:', this.pastPolls.length);
      },
      error: (error) => {
        console.error('Error loading past polls:', error);
        this.errorMessage = 'Could not load past polls';
      }
    });
  }

  private filterPollsForCurrentUser(polls: PollData[]): PollData[] {
    if (!this.currentUserId) {
      console.warn('No current user ID available. Unable to filter polls.');
      return [];
    }

    return polls.filter(poll =>
      poll.voters &&
      poll.voters.includes(this.currentUserId!)
    );
  }

  openPoll(poll: PollData) {
    this.selectedPoll = poll;
    this.selectedAnswer = '';
    this.errorMessage = null;
    this.successMessage = null;

    if (poll.isActive) {
      this.hasVoted = !!(this.currentUserId && poll.voted && poll.voted.includes(this.currentUserId));
    } else {
      this.hasVoted = true;
    }
  }

  closeModal() {
    this.selectedPoll = null;
    this.selectedAnswer = '';
    this.hasVoted = false;
    this.errorMessage = null;
    this.successMessage = null;
  }

  submitVote() {
    if (!this.selectedPoll || !this.selectedAnswer) {
      this.errorMessage = 'Please select an answer';
      return;
    }

    if (!this.selectedPoll.isActive) {
      this.errorMessage = 'This poll is closed';
      return;
    }

    if (!this.selectedPoll.voters.includes(this.currentUserId!)) {
      this.errorMessage = 'You are not authorized to vote on this poll';
      return;
    }

    const answerIndex = this.selectedPoll.answers.indexOf(this.selectedAnswer);
    if (answerIndex === -1) {
      console.error('Selected answer not found in poll options');
      this.errorMessage = 'Invalid selection';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const pollId = this.selectedPoll.id;
    if (!pollId) {
      console.error('Poll ID is missing');
      this.errorMessage = 'Invalid poll';
      this.loading = false;
      return;
    }

    this.pollService.submitVote(pollId, answerIndex).subscribe({
      next: (success) => {
        this.loading = false;

        if (success) {
          if (this.selectedPoll) {
            const updatedResults = [...this.selectedPoll.results];
            updatedResults[answerIndex] = (parseInt(updatedResults[answerIndex]) + 1).toString();
            this.selectedPoll.results = updatedResults;

            if (this.currentUserId && !this.selectedPoll.voted.includes(this.currentUserId)) {
              this.selectedPoll.voted.push(this.currentUserId);
            }
          }

          this.hasVoted = true;
          this.successMessage = 'Your vote has been recorded!';

          setTimeout(() => {
            this.loadPolls();
          }, 2000);
        } else {
          this.errorMessage = 'Unable to submit vote. You may have already voted on this poll.';
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error submitting vote:', error);
        this.errorMessage = 'Failed to submit vote. Please try again.';
      }
    });
  }

  totalVotes(): number {
    return this.selectedPoll?.results.map(r => +r).reduce((a, b) => a + b, 0) || 0;
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }

  hasUserVoted(poll: PollData): boolean {
    return !!(this.currentUserId && poll.voted && poll.voted.includes(this.currentUserId));
  }

  get chartSeries(): number[] {
    return this.selectedPoll?.results?.map(r => +r) ?? [];
  }

  get chartLabels(): string[] {
    return this.selectedPoll?.answers ?? [];
  }

}
