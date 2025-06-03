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
  selectedUsers: User[] = [];
  selectAll = false;

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  emailErrorMessage: string | null = null;
  emailValidationMessages: string[] = [];

  constructor(
    private pollService: PollService,
    private router: Router
  ) { }

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
    if (this.selectAll) {
      this.users.forEach(user => {
        const existingUser = this.selectedUsers.find(selected => selected.uid === user.uid);
        if (!existingUser) {
          this.selectedUsers.push({ ...user, selected: true });
        } else {
          existingUser.selected = true;
        }
      });
    } else {
      this.selectedUsers = [];
    }
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

  // addUserByEmail() {
  //   this.emailErrorMessage = null;

  //   if (!this.newUserEmail.trim()) {
  //     return;
  //   }

  //   const userExists = this.users.find(user =>
  //     user.email.toLowerCase() === this.newUserEmail.toLowerCase().trim()
  //   );

  //   if (!userExists) {
  //     this.emailErrorMessage = 'User with this email does not exist. Please double-check the email address.';
  //     return;
  //   }

  //   const alreadySelected = this.selectedUsers.find(user =>
  //     user.email.toLowerCase() === this.newUserEmail.toLowerCase().trim()
  //   );

  //   if (alreadySelected) {
  //     alreadySelected.selected = true;
  //   } else {
  //     this.selectedUsers.push({ ...userExists, selected: true });
  //   }

  //   this.newUserEmail = '';

  //   this.updateSelectAllState();
  // }

  addUserByEmail() {
  this.emailErrorMessage = null;
  this.emailValidationMessages = [];

  if (!this.newUserEmail.trim()) {
    return;
  }

  const emailList = this.newUserEmail.split(',')
    .map(email => email.trim())
    .filter(email => email !== '');

  let addedCount = 0;
  let alreadySelectedCount = 0;
  const invalidEmails: string[] = [];

  emailList.forEach(email => {
    const userExists = this.users.find(user =>
      user.email.toLowerCase() === email.toLowerCase()
    );

    if (!userExists) {
      invalidEmails.push(email);
      return;
    }

    const alreadySelected = this.selectedUsers.find(user =>
      user.email.toLowerCase() === email.toLowerCase()
    );

    if (alreadySelected) {
      if (!alreadySelected.selected) {
        alreadySelected.selected = true;
        addedCount++;
      } else {
        alreadySelectedCount++;
      }
    } else {
      this.selectedUsers.push({ ...userExists, selected: true });
      addedCount++;
    }
  });

  if (invalidEmails.length > 0) {
    this.emailValidationMessages.push(`Invalid emails: ${invalidEmails.join(', ')}`);
  }

  if (addedCount > 0) {
    this.emailValidationMessages.push(`✓ Successfully added ${addedCount} user(s)`);
  }

  if (alreadySelectedCount > 0) {
    this.emailValidationMessages.push(`${alreadySelectedCount} user(s) were already selected`);
  }

  this.newUserEmail = '';

  this.updateSelectAllState();

  setTimeout(() => {
    this.emailValidationMessages = [];
  }, 5000);
}

  updateSelectAllState() {
    this.selectAll = this.users.length > 0 &&
      this.users.every(user =>
        this.selectedUsers.some(selected =>
          selected.uid === user.uid && selected.selected
        )
      );
  }

  onUserSelectionChange() {
    this.selectedUsers = this.selectedUsers.filter(user => user.selected);
    this.updateSelectAllState();
  }

  createPoll() {
    console.log('createPoll method called');

    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    console.log('Form validated, creating poll...');

    const selectedVoters = this.selectedUsers
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

    const hasVoters = this.selectedUsers.some(user => user.selected);
    if (!hasVoters) {
      this.errorMessage = 'Please select at least one voter';
      return false;
    }

    return true;
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }

  trackByUid(index: number, user: User): string {
    return user.uid;
  }
}
