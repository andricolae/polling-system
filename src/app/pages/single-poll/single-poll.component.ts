import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-single-poll',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './single-poll.component.html',
  styleUrls: ['./single-poll.component.css']
})
export class SinglePollComponent implements OnInit {
  selectedPoll!: PollData | null;
  selectedAnswer: string = '';
  hasVoted: boolean = false;
  loading: boolean = true;
  errorMessage: string = '';
  alreadyVotedMessage: string = '';


  constructor(
    private route: ActivatedRoute,
    private pollService: PollService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    const pollId = this.route.snapshot.paramMap.get('id');

    if (pollId) {
      this.pollService.getPollById(pollId).subscribe({
        next: (poll) => {
          if (!poll) {
            this.router.navigate(['/404']);
            return;
          }
          this.selectedPoll = poll;
          const userEmail = this.pollService.getCurrentUserEmail();
          this.hasVoted = !!poll?.voted?.includes(userEmail || '');

          if (this.hasVoted) {
            this.alreadyVotedMessage = 'You have already voted on this poll.';
          }

          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Could not load the poll.';
          this.loading = false;
          console.error(error);
        }
      });
    } else {
      this.errorMessage = 'Invalid poll ID.';
      this.loading = false;
    }
  }


  submitVote(): void {
    if (!this.selectedPoll?.id || !this.selectedAnswer) return;

    const answerIndex = this.selectedPoll.answers.indexOf(this.selectedAnswer);
    if (answerIndex === -1) return;

    this.pollService.submitVote(this.selectedPoll.id, answerIndex).subscribe((success) => {
      if (success) {
        this.hasVoted = true;
        this.selectedPoll!.results[answerIndex] = (
          parseInt(this.selectedPoll!.results[answerIndex] || '0') + 1
        ).toString();
      }
    });
  }

  totalVotes(): number {
    return this.selectedPoll?.results?.reduce((sum, val) => sum + parseInt(val || '0'), 0) || 0;
  }

  hasPollStarted(): boolean {
    return !!this.selectedPoll && new Date() >= new Date(this.selectedPoll.startTime);
  }

  isPollExpired(): boolean {
    return !!this.selectedPoll && new Date() > new Date(this.selectedPoll.deadline);
  }

  // showResults(): boolean {
  //   // return !this.selectedPoll?.isActive || this.selectedPoll?.realtime && this.hasVoted;
  // }

  isDeadlineReached(): boolean {
    return !!this.selectedPoll && new Date() >= new Date(this.selectedPoll.deadline);
  }

  goBackToList(): void {
    this.router.navigate(['/all-polls']);
  }
  
}
