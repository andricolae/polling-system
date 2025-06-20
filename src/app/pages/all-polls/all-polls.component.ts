import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { combineLatest } from 'rxjs';

import { Subscription } from 'rxjs';
import { start } from 'repl';
import { Store } from '@ngrx/store';
import { selectAuthUser } from '../../auth/auth.selectors';

@Component({
  selector: 'app-all-polls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-polls.component.html',
  styleUrl: './all-polls.component.css'
})
export class AllPollsComponent implements OnInit, OnDestroy {
  allPublicPolls: PollData[] = [];
  allPrivatePolls: PollData[] = [];
  allPolls: PollData[] = [];
  filteredPolls: PollData[] = [];
  loading = false;
  error: string | null = null;

  selectedFilter: 'all' | 'active' | 'closed' | 'pending' = 'all';
  selectedSort: 'newest' | 'oldest' | 'popular' | 'alphabetical' = 'newest';
  searchTerm = '';

  isAdmin = false;

  private subscriptions: Subscription[] = [];

  constructor(
    private pollService: PollService,
    private router: Router,
    private store: Store
  ) { }

  ngOnInit() {

    this.loadAllPolls();
    this.onFilterChange('active');

    this.store.select(selectAuthUser).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });

    // this.loadAllPublicPolls();
    this.onFilterChange('active')

  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAllPolls() {
    this.loading = true;
    this.error = null;
    const email = this.pollService.getCurrentUserEmail();
    const isAuth = !!email;

    // Load both public and private polls
    const combinedSub = combineLatest([
      this.pollService.getAllPublicPolls(),
      this.pollService.getAllPrivatePolls(email) // Pass email to get user-specific private polls
    ]).subscribe({
      next: ([publicPolls, privatePolls]) => {
        // Filter public polls based on user permissions
        this.allPublicPolls = publicPolls.filter(p =>
          this.pollService.canUserViewPoll(p, email, isAuth)
        );

        // Private polls are already filtered in the service
        this.allPrivatePolls = privatePolls;

        // Combine all polls and remove duplicates
        this.combinePolls();
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading polls:', error);
        this.error = 'Failed to load polls. Please try again.';
        this.loading = false;
      }
    });

    this.subscriptions.push(combinedSub);
  }

  private combinePolls() {
    // Combine public and private polls
    const combined = [...this.allPublicPolls, ...this.allPrivatePolls];

    // Remove duplicates based on poll ID
    this.allPolls = combined.filter((poll, index, self) =>
      index === self.findIndex(p => p.id === poll.id)
    );
  }

  onFilterChange(filter: 'all' | 'active' | 'closed' | 'pending') {
    this.selectedFilter = filter;
    this.applyFiltersAndSort();
  }

  onSortChange(sort: 'newest' | 'oldest' | 'popular' | 'alphabetical') {
    this.selectedSort = sort;
    this.applyFiltersAndSort();
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.applyFiltersAndSort();
  }

  applyFiltersAndSort() {
    let polls = [...this.allPolls];
    const now = new Date();

    // Apply status filter
    switch (this.selectedFilter) {
      case 'active':
        polls = polls.filter(poll => poll.isActive && poll.startTime <= now);
        break;
      case 'pending':
        polls = polls.filter(poll => poll.isActive && poll.startTime > now);
        break;
      case 'closed':
        polls = polls.filter(poll => !poll.isActive);
        break;
      case 'all':
      default:
        // Show all polls
        break;
    }

    // Apply search filter
    if (this.searchTerm) {
      polls = polls.filter(poll =>
        poll.title.toLowerCase().includes(this.searchTerm) ||
        poll.question.toLowerCase().includes(this.searchTerm) ||
        poll.description.toLowerCase().includes(this.searchTerm)
      );
    }

    // Apply sorting
    switch (this.selectedSort) {
      case 'newest':
        polls.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
        break;
      case 'oldest':
        polls.sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
        break;
      case 'popular':
        polls.sort((a, b) => this.getTotalVotes(b) - this.getTotalVotes(a));
        break;
      case 'alphabetical':
        polls.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }

    this.filteredPolls = polls;
  }

  navigateToPoll(poll: PollData) {
    if (poll.id) {
      this.router.navigate(['/poll', poll.id]).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }

  navigateToHome() {
    this.router.navigate(['/home']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  getTotalVotes(poll: PollData): number {
    return poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0);
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }

  getStatusColor(poll: PollData): string {
    const now = new Date();

    if (poll.isActive && poll.startTime <= now) {
      return 'text-green-400 bg-green-900/30';
    }
    if (poll.isActive && poll.startTime > now) {
      return 'text-orange-400 bg-orange-900/30';
    }
    return 'text-yellow-400 bg-yellow-900/30';
  }

  getStatusText(poll: PollData): string {
    const now = new Date();

    if (poll.isActive && poll.startTime <= now) {
      return 'Active';
    }
    if (poll.isActive && poll.startTime > now) {
      return 'Pending';
    }
    return 'Closed';
  }

  getProgressPercentage(poll: PollData): number {
    const totalVotes = this.getTotalVotes(poll);
    const maxVotes = Math.max(totalVotes, poll.voters.length || 1);
    return Math.min(100, (totalVotes / maxVotes) * 100);
  }

  onDeletePoll(event: Event, pollId: string) {
    event.stopPropagation();

    this.pollService.deletePoll(pollId).then(() => {
      this.filteredPolls = this.filteredPolls.filter(p => p.id !== pollId);
      this.allPublicPolls = this.allPublicPolls.filter(p => p.id !== pollId);
    }).catch((error) => {
      console.error('Error deleting poll:', error);
    });
  }

}
