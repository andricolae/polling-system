import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
  serverTimestamp
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of } from 'rxjs';
import { Auth } from '@angular/fire/auth';

export interface PollData {
  title: string;
  question: string;
  description: string;
  answers: string[];
  created: any;
  deadline: Date;
  createdBy: string;
  isActive: boolean;
  realtime: boolean;
  results: string[];
  voters: string[];
  voted: string[];
}

export interface User {
  uid: string;
  email: string;
  role: string;
  selected?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PollService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  createPoll(pollData: Omit<PollData, 'created' | 'results' | 'voted'>): Observable<string> {
    console.log('PollService: Creating poll with data:', pollData);
    const pollsRef = collection(this.firestore, 'polls');

    const results = Array(pollData.answers.length).fill('0');

    const pollWithMetadata = {
      ...pollData,
      created: serverTimestamp(),
      results,
      voted: []
    };

    console.log('PollService: Saving poll data to Firestore:', pollWithMetadata);

    return from(addDoc(pollsRef, pollWithMetadata)).pipe(
      map(docRef => {
        console.log('PollService: Poll created with ID:', docRef.id);
        return docRef.id;
      }),
      catchError(error => {
        console.error('PollService: Error creating poll:', error);
        throw error;
      })
    );
  }

  getUsers(): Observable<User[]> {
    console.log('PollService: Fetching users from Firestore');
    const usersRef = collection(this.firestore, 'users');

    return from(getDocs(usersRef)).pipe(
      map(snapshot => {
        const users = snapshot.docs.map(doc => ({
          uid: doc.id,
          email: doc.data()['email'] || '',
          role: doc.data()['role'] || 'user',
          selected: false
        }));
        console.log('PollService: Fetched users:', users);
        return users;
      }),
      catchError(error => {
        console.error('PollService: Error fetching users:', error);
        return of([]);
      })
    );
  }

  getCurrentUserId(): string | null {
    const uid = this.auth.currentUser?.uid || null;
    console.log('PollService: Current user ID:', uid);
    return uid;
  }

  formatEmail(email: string): string {
    if (!email) return '';
    return email.split('@')[0];
  }
}
