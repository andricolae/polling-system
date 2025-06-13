import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-all-polls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './all-polls.component.html',
  styleUrl: './all-polls.component.css'
})
export class AllPollsComponent implements OnInit, OnDestroy {
  allPublicPolls: PollData[] = [];
  filteredPolls: PollData[] = [];
  loading = false;
  error: string | null = null;

  selectedFilter: 'all' | 'active' | 'closed' = 'all';
  selectedSort: 'newest' | 'oldest' | 'popular' | 'alphabetical' = 'newest';
  searchTerm = '';

  private subscriptions: Subscription[] = [];

  constructor(
    private pollService: PollService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllPublicPolls();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  loadAllPublicPolls() {
    this.loading = true;
    this.error = null;

    const pollsSub = this.pollService.getAllPublicPolls().subscribe({
      next: (polls) => {
        this.allPublicPolls = polls;
        this.applyFiltersAndSort();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading all public polls:', error);
        this.error = 'Failed to load polls. Please try again.';
        this.loading = false;
      }
    });

    this.subscriptions.push(pollsSub);
  }

  onFilterChange(filter: 'all' | 'active' | 'closed') {
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
    let polls = [...this.allPublicPolls];

    if (this.selectedFilter === 'active') {
      polls = polls.filter(poll => poll.isActive);
    } else if (this.selectedFilter === 'closed') {
      polls = polls.filter(poll => !poll.isActive);
    }

    if (this.searchTerm) {
      polls = polls.filter(poll =>
        poll.title.toLowerCase().includes(this.searchTerm) ||
        poll.question.toLowerCase().includes(this.searchTerm) ||
        poll.description.toLowerCase().includes(this.searchTerm)
      );
    }

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
      this.router.navigate(['/vote', poll.id]).then(() => {
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
    return poll.isActive ? 'text-green-400 bg-green-900/30' : 'text-yellow-400 bg-yellow-900/30';
  }

  getStatusText(poll: PollData): string {
    return poll.isActive ? 'Active' : 'Closed';
  }

  getProgressPercentage(poll: PollData): number {
    const totalVotes = this.getTotalVotes(poll);
    const maxVotes = Math.max(totalVotes, poll.voters.length || 1);
    return Math.min(100, (totalVotes / maxVotes) * 100);
  }
}
