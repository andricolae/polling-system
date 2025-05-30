import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PollService, User } from '../../services/poll.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-poll-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './poll-create.component.html',
  styleUrl: './poll-create.component.css'
})
export class PollCreateComponent implements OnInit {
  title: string = '';
  question: string = '';
  description: string = '';
  answerOptions: string[] = ['', ''];
  maxOptions = 5;
  resultTiming: 'end' | 'after' = 'end';
  deadline: string = '';
  startTime: string = '';
  newUserEmail: string = '';

  users: User[] = [];
  selectAll = false;

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private pollService: PollService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.pollService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        console.log('Users loaded:', this.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'Could not load users. Please try again.';
      }
    });
  }

  toggleAll() {
    this.users.forEach(user => user.selected = this.selectAll);
  }

  addOption() {
    if (this.answerOptions.length < this.maxOptions) {
      this.answerOptions.push('');
    }
  }

  removeOption(index: number) {
    if (this.answerOptions.length > 2) {
      this.answerOptions.splice(index, 1);
    }
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().slice(0, -8);
  }

  getUsernameFromEmail(email: string): string {
    return this.pollService.formatEmail(email);
  }

  createPoll() {
    console.log('createPoll method called');

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    console.log('Form validated, creating poll...');

    const selectedVoters = this.users
      .filter(user => user.selected)
      .map(user => user.uid);

    const newPoll = {
      title: this.title,
      question: this.question,
      description: this.description,
      answers: this.answerOptions.filter(opt => opt.trim() !== ''),
      deadline: new Date(this.deadline),
      createdBy: this.pollService.getCurrentUserId() || '',
      isActive: true,
      realtime: this.resultTiming === 'after',
      voters: selectedVoters
    };

    console.log('Poll data to be saved:', newPoll);

    this.pollService.createPoll(newPoll).subscribe({
      next: (pollId) => {
        this.loading = false;
        this.successMessage = 'Poll created successfully!';
        console.log('Poll created with ID:', pollId);

        setTimeout(() => {
          this.router.navigate(['/vote']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating poll:', error);
        this.errorMessage = 'Failed to create poll. Please try again.';
      }
    });
  }

  validateForm(): boolean {
    this.errorMessage = null;

    if (!this.title.trim()) {
      this.errorMessage = 'Please enter a poll title';
      return false;
    }

    if (!this.question.trim()) {
      this.errorMessage = 'Please enter a question';
      return false;
    }

    const validOptions = this.answerOptions.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      this.errorMessage = 'Please provide at least 2 answer options';
      return false;
    }

    if (!this.deadline) {
      this.errorMessage = 'Please set a deadline';
      return false;
    }

    const deadlineDate = new Date(this.deadline);
    if (deadlineDate <= new Date()) {
      this.errorMessage = 'Deadline must be in the future';
      return false;
    }

    const hasVoters = this.users.some(user => user.selected);
    if (!hasVoters) {
      this.errorMessage = 'Please select at least one voter';
      return false;
    }

    return true;
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }

  addUserByEmail(){

  }
}
