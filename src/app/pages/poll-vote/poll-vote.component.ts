import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PollService, PollData } from '../../services/poll.service';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PieChartComponent } from "../../components/pie-chart/pie-chart.component";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-poll-vote',
  standalone: true,
  imports: [FormsModule, DatePipe, CommonModule, PieChartComponent],
  templateUrl: './poll-vote.component.html',
  styleUrl: './poll-vote.component.css'
})
export class PollVoteComponent implements OnInit, OnDestroy {
  ongoingPolls: PollData[] = [];
  pastPolls: PollData[] = [];
  selectedPoll: PollData | null = null;

  loading = false;
  selectedAnswer: string = '';
  hasVoted: boolean = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  currentUserId: string | null = null;
  isAdmin: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private pollService: PollService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    console.log('Vote component initializing...');

    this.currentUserId = this.pollService.getCurrentUserId();
    console.log('Current user ID from service:', this.currentUserId);

    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      this.isAdmin = parsedUser?.role === 'admin';
    }

    console.log('User in localStorage:', savedUser);

    this.pollService.getCurrentUserId();
    console.log('Auth state when vote component loads');

    this.loadPolls();
    this.checkForDirectPollAccess();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private checkForDirectPollAccess() {
    const routeSub = this.route.params.subscribe(params => {
      const pollId = params['pollId'];
      if (pollId) {
        console.log('Direct poll access requested for ID:', pollId);
        setTimeout(() => {
          this.openPollById(pollId);
        }, 1000);
      }
    });
    this.subscriptions.push(routeSub);
  }

  private openPollById(pollId: string) {
    let poll = this.ongoingPolls.find(p => p.id === pollId);

    if (!poll) {
      poll = this.pastPolls.find(p => p.id === pollId);
    }
    const currentUserEmail = this.pollService.getCurrentUserEmail();
    const isAuthenticated = !!this.currentUserId;

    // if (poll) {
    //   console.log('Found poll to open:', poll);
    //   this.openPoll(poll);
    this.pollService.getPollById(pollId).subscribe(poll => {
      if (poll && this.pollService.canUserViewPoll(poll, currentUserEmail, isAuthenticated)) {
        this.openPoll(poll);
      } else {
        console.warn('Poll not found with ID:', pollId);
        this.router.navigate(['/404']);
      }
    });
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  loadPolls() {
    this.loading = true;
    this.errorMessage = null;

    const activePollsSub = this.pollService.getActivePolls().subscribe({
      next: (polls) => {
        this.ongoingPolls = this.isAdmin ? polls : this.filterPollsForCurrentUser(polls);
        console.log('Active polls loaded:', this.ongoingPolls.length);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading active polls:', error);
        this.errorMessage = 'Could not load active polls';
        this.loading = false;
      }
    });

    const pastPollsSub = this.pollService.getPastPolls().subscribe({
      next: (polls) => {
        this.pastPolls = this.isAdmin ? polls : this.filterPollsForCurrentUser(polls);
        console.log('Past polls loaded:', this.pastPolls.length);
      },
      error: (error) => {
        console.error('Error loading past polls:', error);
        this.errorMessage = 'Could not load past polls';
      }
    });

    this.subscriptions.push(activePollsSub, pastPollsSub);
  }

  private filterPollsForCurrentUser(polls: PollData[]): PollData[] {
    if (!this.currentUserId) {
      console.warn('No current user ID available. Unable to filter polls.');
      return [];
    }

    const currentUserEmail = this.pollService.getCurrentUserEmail();
    const isAuthenticated = !!this.currentUserId;
    const now = new Date();

    // return polls.filter(poll =>
    //   poll.voters?.includes(this.currentUserId!) &&
    //   poll.startTime <= now
    // );
    return polls.filter(poll =>
      this.pollService.canUserViewPoll(poll, currentUserEmail, isAuthenticated) &&
      poll.startTime <= now
    );
  }

  openPoll(poll: PollData) {
    this.selectedPoll = poll;
    this.selectedAnswer = '';
    this.errorMessage = null;
    this.successMessage = null;

    if (poll.isActive) {
      this.hasVoted = this.isAdmin || !!(this.currentUserId && poll.voted && poll.voted.includes(this.currentUserId));
    } else {
      this.hasVoted = true;
    }

    console.log('Opened poll:', poll.title, 'Has voted:', this.hasVoted);
  }

  closeModal() {
    this.selectedPoll = null;
    this.selectedAnswer = '';
    this.hasVoted = false;
    this.errorMessage = null;
    this.successMessage = null;

    this.router.navigate(['/vote'], { replaceUrl: true });
  }

  submitVote() {
    if (this.isAdmin) return;

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
    if (!this.hasPollStarted(this.selectedPoll)) {
      this.errorMessage = 'This poll has not started yet,';
      return;
    }

    const voteSub = this.pollService.submitVote(pollId, answerIndex).subscribe({
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

    this.subscriptions.push(voteSub);
  }

  totalVotes(): number {
    return this.selectedPoll?.results.map(r => +r).reduce((a, b) => a + b, 0) || 0;
  }

  parseInt(value: string): number {
    return parseInt(value) || 0;
  }

  hasUserVoted(poll: PollData): boolean {
    return this.isAdmin || !!(this.currentUserId && poll.voted && poll.voted.includes(this.currentUserId));
  }

  get chartSeries(): number[] {
    return this.selectedPoll?.results?.map(r => +r) ?? [];
  }

  get chartLabels(): string[] {
    return this.selectedPoll?.answers ?? [];
  }

  hasPollStarted(poll: PollData): boolean {
    return new Date() >= new Date(poll.startTime);
  }
}
