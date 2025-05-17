import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Poll {
  id: string;
  question:string;
  answers:string[];
  created: Date;
  deadline: Date;
  createdBy:string;
  description:string;
  isActive:boolean;
  realtime: false;
  results: string[];
  title: string;
  totalVoters: number;
  voters: string[];
}

@Component({
  selector: 'app-poll-vote',
  imports: [NgFor, NgIf, FormsModule, DatePipe],
  templateUrl: './poll-vote.component.html',
  styleUrl: './poll-vote.component.css'
})
export class PollVoteComponent {
  selectedAnswer: string = '';
  hasVoted: boolean = false;
  selectedPoll: Poll | null = null;

  submitVote() {
    this.hasVoted = true;
    // You would submit this to Firebase
  }

  totalVotes(): number {
    return this.selectedPoll?.results.map(r => +r).reduce((a, b) => a + b, 0) || 0;
  }

  ongoingPolls: Poll[] = [
    {
      id: 'poll1',
      question: 'What do you think about the app design?',
      answers: ['Super cool', 'Boooring'],
      created: new Date('2025-05-13T13:00:00Z'),
      deadline: new Date('2025-05-27T13:00:00Z'),
      createdBy: 'uid1',
      description: 'Test poll about page design.',
      isActive: true,
      realtime: false,
      results: ['1', '1'],
      title: 'Test Poll',
      totalVoters: 2,
      voters: ['uid1', 'uid2', 'uid3']
    },
    { id: 'poll2',
      question: 'What do you think about the app overall?',
      answers: ['Yay', 'Nay'],
      created: new Date('2025-06-01T13:00:00Z'),
      deadline: new Date('2025-06-08T13:00:00Z'),
      createdBy: 'uid1',
      description: 'Test poll about app.',
      isActive: true,
      realtime: false,
      results: ['1', '1'],
      title: 'Poll about the app',
      totalVoters: 2,
      voters: ['uid1', 'uid2', 'uid3'] }
  ];

  pastPolls: Poll[] = [
    {
      id: 'poll3',
      question: 'Do you like Angular?',
      answers: ['Yes', 'No'],
      created: new Date('2025-04-01T13:00:00Z'),
      deadline: new Date('2025-05-01T13:00:00Z'),
      createdBy: 'uid2',
      description: 'Opinion about Angular',
      isActive: false,
      realtime: false,
      results: ['4', '1'],
      title: 'Angular Poll',
      totalVoters: 5,
      voters: ['uid1', 'uid2', 'uid3', 'uid4', 'uid5']
    },
    {
      id: 'poll4',
      question: 'Should we use Tailwind?',
      answers: ['Absolutely', 'Not really'],
      created: new Date('2025-04-10T13:00:00Z'),
      deadline: new Date('2025-05-10T13:00:00Z'),
      createdBy: 'uid2',
      description: 'Feedback on Tailwind usage',
      isActive: false,
      realtime: false,
      results: ['3', '2'],
      title: 'Tailwind CSS Poll',
      totalVoters: 5,
      voters: ['uid1', 'uid2', 'uid3', 'uid4', 'uid5']
    }
  ];

  openPoll(poll: Poll) {
    this.selectedPoll = poll;
    this.hasVoted = !poll.isActive;
    this.selectedAnswer = '';
  }

  closeModal() {
    this.selectedPoll = null;
    this.selectedAnswer = '';
    this.hasVoted = false;
  }
  
}
