import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { selectIsAuthenticated } from '../../auth/auth.selectors';
import { CommonModule } from '@angular/common';
import { PollService, PollData } from '../../services/poll.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  latestPublicPolls: PollData[] = [];
  popularPublicPolls: PollData[] = [];
  loading = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private store: Store,
    private pollService: PollService
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  ngOnInit() {
    this.loadPublicPolls();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadPublicPolls() {
    this.loading = true;

    const latestSub = this.pollService.getLatestPublicPolls(3).subscribe({
      next: (polls) => {
        this.latestPublicPolls = polls;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading latest public polls:', error);
        this.loading = false;
      }
    });

    const popularSub = this.pollService.getMostPopularPublicPolls(3).subscribe({
      next: (polls) => {
        this.popularPublicPolls = polls;
      },
      error: (error) => {
        console.error('Error loading popular public polls:', error);
      }
    });

    this.subscriptions.push(latestSub, popularSub);
  }

  handleGetStarted() {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/vote']).then(() => {
          window.scrollTo(0, 0);
        });
      } else {
        this.router.navigate(['/login']).then(() => {
          window.scrollTo(0, 0);
        });
      }
    }).unsubscribe();
  }

  handleStartPolling() {
    this.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['/vote']).then(() => {
          window.scrollTo(0, 0);
        });
      } else {
        this.router.navigate(['/login']).then(() => {
          window.scrollTo(0, 0);
        });
      }
    }).unsubscribe();
  }

  goToLogin() {
    this.router.navigate(['/login']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  navigateToAllPolls() {
    this.router.navigate(['/all-polls']).then(() => {
      window.scrollTo(0, 0);
    });
  }

  navigateToPoll(poll: PollData) {
    if (poll.id) {
      this.router.navigate(['/vote', poll.id]).then(() => {
        window.scrollTo(0, 0);
      });
    }
  }

  scrollToFeatures() {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
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
}
