import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface User {
  id: number;
  name: string;
  email: string;
  selected: boolean; // Adăugat explicit
}

@Component({
  selector: 'app-poll-create',
  imports: [ FormsModule, CommonModule ],
  templateUrl: './poll-create.component.html',
  styleUrl: './poll-create.component.css'
})
export class PollCreateComponent {
  users: User[] = [
    { id: 1, name: 'Alice', email: 'alice@example.com', selected: false },
    { id: 3, name: 'Clara', email: 'clara@example.com', selected: false },
    { id: 4, name: 'Dan', email: 'dan@example.com', selected: false },
    { id: 5, name: 'Elena', email: 'elena@example.com', selected: false }
  ];

  selectAll = false;

  toggleAll() {
    this.users.forEach(user => user['selected'] = this.selectAll);
  }

  answerOptions: string[] = [''];
  maxOptions = 5;

  addOption() {
    if (this.answerOptions.length < this.maxOptions) {
      this.answerOptions.push('');
    }
  }
}
