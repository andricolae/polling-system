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

  isPublic: boolean = false;

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
        const existingUser = this.selectedUsers.find(selected => selected.email === user.email);
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

  addUserByEmail() {
    this.emailErrorMessage = null;
    this.emailValidationMessages = [];

    if (!this.newUserEmail.trim()) return;

    const emailList = this.newUserEmail.split(',')
      .map(email => email.trim().toLowerCase())
      .filter(email => email !== '');

    let addedCount = 0;
    let alreadySelectedCount = 0;
    const invalidEmails: string[] = [];

    emailList.forEach(email => {
      const userExists = this.users.find(user =>
        user.email.toLowerCase() === email
      );

      const alreadySelected = this.selectedUsers.find(user =>
        user.email.toLowerCase() === email
      );

      if (alreadySelected) {
        if (!alreadySelected.selected) {
          alreadySelected.selected = true;
          addedCount++;
        } else {
          alreadySelectedCount++;
        }
      } else if (userExists) {
        this.selectedUsers.push({ ...userExists, selected: true });
        addedCount++;
      } else {
        const newUser: User = {
          uid: '', 
          email,
          role: 'user',
          selected: true
        };
        this.selectedUsers.push(newUser);
        addedCount++;
      }
    });

    if (invalidEmails.length > 0) {
      this.emailValidationMessages.push(`Invalid emails: ${invalidEmails.join(', ')}`);
    }

    if (addedCount > 0) {
      this.emailValidationMessages.push(`Successfully added ${addedCount} user(s)`);
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
    if (!this.validateForm()) {
      return;
    }

    this.loading = true;
    let selectedVoters: string[] = [];

    if (!this.isPublic) {
      const emailsFromSelectedUsers = this.selectedUsers
        .map(user => user.email?.toLowerCase())
        .filter(email => !!email);

      const emailsFromManualEntry = this.newUserEmail
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(email => email && !emailsFromSelectedUsers.includes(email));

      selectedVoters = [...emailsFromSelectedUsers, ...emailsFromManualEntry];
    }

    const newPoll = {
      title: this.title,
      question: this.question,
      description: this.description,
      answers: this.answerOptions.filter(opt => opt.trim() !== ''),
      deadline: new Date(this.deadline),
      startTime: new Date(this.startTime),
      createdBy: this.pollService.getCurrentUserId() || '',
      isActive: true,
      realtime: this.resultTiming === 'after',
      isPublic: this.isPublic,
      voters: this.isPublic ? [] : selectedVoters
    };

    this.pollService.createPoll(newPoll).subscribe({
      next: (pollId) => {
        this.loading = false;
        this.successMessage = 'Poll created successfully!';

        setTimeout(() => {
          this.router.navigate(['/vote']);
        }, 2000);
      },
      error: (error) => {
        this.loading = false;
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

    if (!this.startTime) {
      this.errorMessage = 'Please set a starting time';
      return false;
    }

    const deadlineDate = new Date(this.deadline);
    if (deadlineDate <= new Date()) {
      this.errorMessage = 'Deadline must be in the future';
      return false;
    }

    if (!this.isPublic) {
      const hasVoters = this.selectedUsers.some(user => user.selected);
      const isMembersOnly = hasVoters;
      if (isMembersOnly && !hasVoters) {
        this.errorMessage = 'Please select at least one voter for members-only polls';
        return false;
      }
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
