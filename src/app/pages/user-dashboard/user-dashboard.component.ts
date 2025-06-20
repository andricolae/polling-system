import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { Subscription, combineLatest } from 'rxjs';
import { CommonModule, NgFor, NgIf } from '@angular/common';

interface UserPoll {
  id: string;
  title: string;
  description: string;
  hasVoted: boolean;
  deadline: string;
  totalVotes: number;
  progressPercent: number;
  isActive: boolean;
}

interface VotingHistory {
  title: string;
  yourVote: string;
  voteDate: Date;
}

interface Notification {
  message: string;
  time: string;
}

interface Deadline {
  title: string;
  timeLeft: string;
}

@Component({
  selector: 'app-user-dashboard',
  imports: [NgFor, NgIf, CommonModule],
  templateUrl: './user-dashboard.component.html',
  styleUrl: './user-dashboard.component.css'
})
export class UserDashboardComponent implements OnInit, OnDestroy {

  availablePolls = 0;
  completedVotes = 0;
  pendingPolls = 0;
  participationRate = 0;
  currentStreak = 0;

  activePolls: UserPoll[] = [];
  votedPolls: VotingHistory[] = [];
  notifications: Notification[] = [];
  upcomingDeadlines: Deadline[] = [];

  streakDays = [
    { active: true },
    { active: true },
    { active: false },
    { active: true },
    { active: true },
    { active: true },
    { active: true }
  ];

  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];
  private currentUserId: string | null = null;

  constructor(private router: Router, private pollService: PollService) {}

  ngOnInit() {
    this.currentUserId = this.pollService.getCurrentUserId();
    this.loadUserData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  refreshData() {
    this.loadUserData();

    this.notifications.unshift({
      message: 'Dashboard data refreshed successfully',
      time: 'Just now'
    });

    setTimeout(() => {
      this.notifications = this.notifications.filter(n => n.message !== 'Dashboard data refreshed successfully');
    }, 3000);
  }

  private loadUserData() {
    if (!this.currentUserId) {
      this.error = 'You must be logged in to view this page';
      this.loading = false;
      return;
    }

    this.loading = true;
    this.error = null;

    const activePolls$ = this.pollService.getActivePolls();
    const pastPolls$ = this.pollService.getPastPolls();

    const subscription = combineLatest([activePolls$, pastPolls$]).subscribe({
      next: ([activePolls, pastPolls]) => {
        this.processPolls(activePolls, pastPolls);
        this.calculateStats();
        this.generateNotifications();
        this.generateUpcomingDeadlines();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user dashboard data:', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private processPolls(activePolls: PollData[], pastPolls: PollData[]) {
    const userActivePolls = activePolls.filter(poll =>
      poll.voters && poll.voters.includes(this.currentUserId!)
    );

    const userPastPolls = pastPolls.filter(poll =>
      poll.voters && poll.voters.includes(this.currentUserId!)
    );

    this.activePolls = userActivePolls.map(poll => this.convertToUserPoll(poll));

    this.votedPolls = userPastPolls
      .filter(poll => poll.voted && poll.voted.includes(this.currentUserId!))
      .map(poll => ({
        title: poll.title,
        yourVote: 'Your vote was recorded',
        voteDate: poll.created?.toDate ? poll.created.toDate() : new Date(poll.created)
      }))
      .sort((a, b) => b.voteDate.getTime() - a.voteDate.getTime())
      .slice(0, 5);
  }

  private convertToUserPoll(poll: PollData): UserPoll {
    const totalVotes = poll.results?.reduce((sum, result) => sum + parseInt(result || '0'), 0) || 0;
    const hasVoted = poll.voted && poll.voted.includes(this.currentUserId!) || false;

    const totalPossibleVotes = poll.voters?.length || 1;
    const progressPercent = Math.min(95, (totalVotes / totalPossibleVotes) * 100);

    return {
      id: poll.id || '',
      title: poll.title,
      description: poll.description,
      hasVoted,
      deadline: this.formatDeadline(poll.deadline),
      totalVotes,
      progressPercent: Math.round(progressPercent),
      isActive: poll.isActive
    };
  }

  private formatDeadline(deadline: Date): string {
    const now = new Date();
    const deadlineDate = deadline instanceof Date ? deadline : new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff < 0) return 'Expired';
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Tomorrow';
    if (daysDiff < 7) return `in ${daysDiff} days`;
    if (daysDiff < 14) return 'in 1 week';
    return `in ${Math.ceil(daysDiff / 7)} weeks`;
  }

  private calculateStats() {
    this.availablePolls = this.activePolls.length;
    this.completedVotes = this.votedPolls.length;
    this.pendingPolls = this.activePolls.filter(poll => !poll.hasVoted).length;

    const totalPolls = this.availablePolls + this.completedVotes;
    this.participationRate = totalPolls > 0 ? Math.round((this.completedVotes / totalPolls) * 100) : 0;

    this.currentStreak = Math.min(this.completedVotes, 7);
  }

  private generateNotifications() {
    this.notifications = [];

    this.activePolls.forEach(poll => {
      if (!poll.hasVoted && poll.deadline.includes('day')) {
        this.notifications.push({
          message: `Poll "${poll.title}" deadline approaching`,
          time: '2 hours ago'
        });
      }
    });

    if (this.activePolls.length > 0) {
      this.notifications.push({
        message: `${this.activePolls.length} active polls available for voting`,
        time: '1 day ago'
      });
    }

    if (this.completedVotes > 0) {
      this.notifications.push({
        message: `You've completed ${this.completedVotes} polls this month!`,
        time: '2 days ago'
      });
    }

    this.notifications = this.notifications.slice(0, 3);
  }

  private generateUpcomingDeadlines() {
    this.upcomingDeadlines = this.activePolls
      .filter(poll => !poll.hasVoted && poll.isActive)
      .sort((a, b) => {
        const urgencyA = this.getDeadlineUrgency(a.deadline);
        const urgencyB = this.getDeadlineUrgency(b.deadline);
        return urgencyA - urgencyB;
      })
      .map(poll => ({
        title: poll.title,
        timeLeft: poll.deadline
      }))
      .slice(0, 3);
  }

  private getDeadlineUrgency(deadline: string): number {
    if (deadline.includes('Today')) return 0;
    if (deadline.includes('Tomorrow')) return 1;
    if (deadline.includes('day')) {
      const match = deadline.match(/in (\d+) days/);
      return match ? parseInt(match[1]) : 999;
    }
    if (deadline.includes('week')) {
      const match = deadline.match(/in (\d+) week/);
      return match ? parseInt(match[1]) * 7 + 100 : 999;
    }
    return 999;
  }

  private calculateStreak() {
    this.currentStreak = Math.min(this.completedVotes, 30);

    this.streakDays = [];
    const recentVotes = Math.min(this.completedVotes, 7);

    for (let i = 0; i < 7; i++) {
      const isActive = i < recentVotes && Math.random() > 0.3;
      this.streakDays.push({ active: isActive });
    }
  }

  navigateToPoll(poll: UserPoll) {
    if (poll.id) {
      this.router.navigate(['/poll', poll.id]);
    } else {
      this.router.navigate(['/all-polls']);
    }
  }
}
