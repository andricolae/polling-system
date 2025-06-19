import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PollData, PollService, User } from '../../services/poll.service';

@Component({
  selector: 'app-update-poll',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './update-poll.component.html',
  styleUrl: './update-poll.component.css'
})
export class UpdatePollComponent implements OnInit {
  poll!: PollData;
  users: User[] = [];
  selectedUsers: User[] = [];
  selectAll = false;
  isPublic = false;
  visibility!: 'public' | 'private' | 'membersOnly';
  loading = true;
  saving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  formattedStartTime!: string;
  formattedDeadline!: string;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pollService: PollService
  ) { }

  ngOnInit(): void {
    const pollId = this.route.snapshot.paramMap.get('id');
    if (!pollId) {
      this.router.navigate(['/']);
      return;
    }

    this.pollService.getUsers().subscribe(u => this.users = u);

    this.pollService.getPollById(pollId).subscribe(p => {
      this.loading = false;

      if (!p) {
        this.router.navigate(['/']);
        return;
      }

      const currentUser = this.pollService.getCurrentUserId();
      const now = new Date();

      if (p.createdBy !== currentUser || new Date(p.startTime) <= now) {
        this.router.navigate(['/404']);
        return;
      }

      this.formattedStartTime = this.formatDateTimeLocal(p.startTime);
      this.formattedDeadline = this.formatDateTimeLocal(p.deadline);

      this.formattedStartTime = this.formatDateTimeLocal(p.startTime);
      this.formattedDeadline = this.formatDateTimeLocal(p.deadline);

      this.poll = p;
      if (p.isPublic) {
        this.visibility = 'public';
      } else if (p.voters.length === 0) {
        this.visibility = 'private';
      } else {
        this.visibility = 'membersOnly';
      }
      this.selectedUsers = this.users
        .filter(u => p.voters.includes(u.email))
        .map(u => ({ ...u, selected: true }));

      this.selectAll = this.selectedUsers.length === this.users.length;
    });

  }

  toggleAll() {
    this.selectAll = !this.selectAll;
    this.selectedUsers = this.selectAll
      ? [...this.users.map(u => ({ ...u, selected: true }))]
      : [];
  }

  onUserChange() {
    this.selectedUsers = this.selectedUsers.filter(u => u.selected);
    this.selectAll = this.selectedUsers.length === this.users.length;
  }

  formatDateTimeLocal(date: string | Date): string {
    const d = new Date(date);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }


  save(form: NgForm) {
    if (form.invalid) return;

    this.saving = true;
    const updated: Partial<PollData> = {
      title: this.poll.title,
      question: this.poll.question,
      description: this.poll.description,
      startTime: new Date(this.formattedStartTime),
      deadline: new Date(this.formattedDeadline),
      answers: this.poll.answers,
      isPublic: this.isPublic,
      voters: this.isPublic
        ? []
        : this.selectedUsers.map(u => u.email.toLowerCase())
    };

    this.pollService.updatePoll(this.poll.id!, updated).subscribe({
      next: () => {
        this.saving = false;
        this.successMessage = 'Poll updated successfully.';
        setTimeout(() => this.router.navigate(['/vote']), 1500);
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMessage = 'Failed to update poll. Try again.';
      }
    });
  }
}
