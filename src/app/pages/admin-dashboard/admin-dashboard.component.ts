import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PollService, PollData } from '../../services/poll.service';
import { Subscription, combineLatest, map } from 'rxjs';

interface DisplayPoll extends PollData {
  status: 'Active' | 'Closed';
  responseRate: number;
  createdDate: string;
  votes: number;
}

interface Activity {
  message: string;
  time: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {

  totalPolls = 0;
  activeUsers = 0;
  totalVotes = 0;
  todayVotes = 0;
  responseRate = 0;

  pollsThisWeek = 0;
  pollsGrowth = 0;
  votesThisWeek = 0;
  votesGrowth = 0;
  newUsersThisWeek = 0;
  usersGrowth = 0;
  avgEngagement = 0;
  engagementGrowth = 0;

  recentPolls: DisplayPoll[] = [];

  recentActivity: Activity[] = [];

  loading = true;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private pollService: PollService
  ) { }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }

  exportData() {
    const data = {
      polls: this.recentPolls,
      stats: {
        totalPolls: this.totalPolls,
        totalVotes: this.totalVotes,
        activeUsers: this.activeUsers,
        responseRate: this.responseRate
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chime-in-admin-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private loadDashboardData() {
    this.loading = true;
    this.error = null;

    const activePolls$ = this.pollService.getActivePolls();
    const pastPolls$ = this.pollService.getPastPolls();
    const users$ = this.pollService.getUsers();

    const combinedData$ = combineLatest([
      activePolls$,
      pastPolls$,
      users$
    ]).pipe(
      map(([activePolls, pastPolls, users]) => ({
        activePolls,
        pastPolls,
        users,
        allPolls: [...activePolls, ...pastPolls]
      }))
    );

    const subscription = combinedData$.subscribe({
      next: ({ activePolls, pastPolls, users, allPolls }) => {
        this.calculateStats(allPolls, users);
        this.recentPolls = this.processPolls(allPolls);
        this.generateActivity(allPolls);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });

    this.subscriptions.push(subscription);
  }

  private processPolls(allPolls: PollData[]): DisplayPoll[] {
    const now = new Date();

    return allPolls
      .map(poll => {
        const deadline = poll.deadline instanceof Date ? poll.deadline : new Date(poll.deadline);
        const status: 'Active' | 'Closed' = deadline > now ? 'Active' : 'Closed';

        const votes = poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0);

        const totalPossibleVotes = poll.voters.length;
        const responseRate = totalPossibleVotes > 0 ? Math.round((votes / totalPossibleVotes) * 100) : 0;

        const createdDate = poll.created?.toDate ?
          poll.created.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
          new Date(poll.created).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        return {
          ...poll,
          status,
          responseRate,
          createdDate,
          votes
        } as DisplayPoll;
      })
      .sort((a, b) => {
        const dateA = a.created?.toDate ? a.created.toDate() : new Date(a.created);
        const dateB = b.created?.toDate ? b.created.toDate() : new Date(b.created);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 4);
  }

  private calculateStats(allPolls: PollData[], users: any[]) {
    this.totalPolls = allPolls.length;
    this.activeUsers = users.length;

    this.totalVotes = allPolls.reduce((total, poll) => {
      return total + poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0);
    }, 0);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activeToday = allPolls.filter(poll => {
      const deadline = poll.deadline instanceof Date ? poll.deadline : new Date(poll.deadline);
      return deadline > todayStart;
    });

    this.todayVotes = activeToday.reduce((total, poll) => {
      return total + Math.floor(poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0) * 0.1);
    }, 0);

    const totalPossibleVotes = allPolls.reduce((total, poll) => total + poll.voters.length, 0);
    this.responseRate = totalPossibleVotes > 0 ? Math.round((this.totalVotes / totalPossibleVotes) * 100) : 0;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    this.pollsThisWeek = allPolls.filter(poll => {
      const pollDate = poll.created?.toDate ? poll.created.toDate() : new Date(poll.created);
      return pollDate >= weekAgo;
    }).length;

    this.votesThisWeek = allPolls
      .filter(poll => {
        const pollDate = poll.created?.toDate ? poll.created.toDate() : new Date(poll.created);
        return pollDate >= weekAgo;
      })
      .reduce((total, poll) => total + poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0), 0);

    this.newUsersThisWeek = Math.floor(users.length * 0.1);

    this.pollsGrowth = this.pollsThisWeek > 0 ? Math.floor(Math.random() * 20) + 5 : 0;
    this.votesGrowth = this.votesThisWeek > 0 ? Math.floor(Math.random() * 25) + 10 : 0;
    this.usersGrowth = this.newUsersThisWeek > 0 ? Math.floor(Math.random() * 15) + 5 : 0;
    this.avgEngagement = Math.min(95, this.responseRate + Math.floor(Math.random() * 10));
    this.engagementGrowth = Math.floor(Math.random() * 10) + 2;
  }

  private generateActivity(allPolls: PollData[]) {
    this.recentActivity = [];
    const now = new Date();

    allPolls.slice(0, 5).forEach((poll, index) => {
      const totalVotes = poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0);
      const deadline = poll.deadline instanceof Date ? poll.deadline : new Date(poll.deadline);
      const isActive = deadline > now;
      const timeAgo = this.getTimeAgo(index);

      if (totalVotes > 0) {
        this.recentActivity.push({
          message: `${totalVotes} votes received on "${poll.title}"`,
          time: timeAgo,
          icon: 'M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11'
        });
      }

      if (isActive) {
        this.recentActivity.push({
          message: `Poll "${poll.title}" is currently active`,
          time: timeAgo,
          icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6'
        });
      } else {
        this.recentActivity.push({
          message: `Poll "${poll.title}" deadline has passed`,
          time: timeAgo,
          icon: 'M6 18L18 6M6 6l12 12'
        });
      }
    });

    this.recentActivity = this.recentActivity.slice(0, 5);
  }

  private getTimeAgo(index: number): string {
    const times = ['2 hours ago', '4 hours ago', '6 hours ago', '8 hours ago', '12 hours ago'];
    return times[index] || '1 day ago';
  }

  navigateToPoll(poll: DisplayPoll) {
    if (poll.id) {
      this.router.navigate(['/poll', poll.id]);
    } else {
      this.router.navigate(['/vote']);
    }
  }
}
