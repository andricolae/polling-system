import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  DocumentData,
  serverTimestamp,
  QuerySnapshot,
  getDoc,
  doc,
  updateDoc,
  DocumentReference,
  arrayUnion,
  orderBy,
  limit,
  collectionData,
  deleteDoc
} from '@angular/fire/firestore';
import { Observable, from, map, catchError, of, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { isPlatformBrowser } from '@angular/common';

export interface PollData {
  id?: string;
  title: string;
  question: string;
  description: string;
  answers: string[];
  created: any;
  deadline: Date;
  startTime: Date;
  createdBy: string;
  isActive: boolean;
  realtime: boolean;
  results: string[];
  voters: string[];
  voted: string[];
  isPublic?: boolean;
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
  private platformId = inject(PLATFORM_ID);

  createPoll(pollData: Omit<PollData, 'created' | 'results' | 'voted' | 'id'>): Observable<string> {
    const pollsRef = collection(this.firestore, 'polls');

    const results = Array(pollData.answers.length).fill('0');

    const pollWithMetadata = {
      ...pollData,
      created: serverTimestamp(),
      results,
      voted: [],
      isPublic: pollData.isPublic || false
    };

    return from(addDoc(pollsRef, pollWithMetadata)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error creating poll:', error);
        throw error;
      })
    );
  }

  getUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, 'users');
    return from(getDocs(usersRef)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          uid: doc.id,
          email: doc.data()['email'] || '',
          role: doc.data()['role'] || 'user',
          selected: false
        }))
      ),
      catchError(error => {
        console.error('Error fetching users:', error);
        return of([]);
      })
    );
  }

  getCurrentUserId(): string | null {
    if (this.auth.currentUser?.uid) {
      return this.auth.currentUser.uid;
    }

    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          return user?.uid || null;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
          return null;
        }
      }
    }

    return null;
  }

  getCurrentUserEmail(): string | null {
    if (this.auth.currentUser?.email) {
      return this.auth.currentUser.email;
    }

    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          return user?.email || null;
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
          return null;
        }
      }
    }

    return null;
  }

  formatEmail(email: string): string {
    if (!email) return '';
    return email.split('@')[0];
  }

  getActivePolls(): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    const activeQuery = query(pollsRef, where('isActive', '==', true));

    return from(getDocs(activeQuery)).pipe(
      map(snapshot => this.processPollSnapshot(snapshot)),
      catchError(error => {
        console.error('Error fetching active polls:', error);
        return of([]);
      })
    );
  }

  getPastPolls(): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    const pastQuery = query(pollsRef, where('isActive', '==', false));

    return from(getDocs(pastQuery)).pipe(
      map(snapshot => this.processPollSnapshot(snapshot)),
      catchError(error => {
        console.error('Error fetching past polls:', error);
        return of([]);
      })
    );
  }

  getAllPolls(): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    return collectionData(pollsRef, { idField: 'id' }) as Observable<PollData[]>;
  }

  getLatestPublicPolls(limitCount: number = 3): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    const latestQuery = query(
      pollsRef,
      where('isPublic', '==', true),
      where('isActive', '==', true),
      orderBy('created', 'desc'),
      limit(limitCount)
    );

    return from(getDocs(latestQuery)).pipe(
      map(snapshot => this.processPollSnapshot(snapshot)),
      catchError(error => {
        console.error('Error fetching latest public polls:', error);
        return of([]);
      })
    );
  }

  getMostPopularPublicPolls(limitCount: number = 3): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    const popularQuery = query(
      pollsRef,
      where('isPublic', '==', true)
    );

    return from(getDocs(popularQuery)).pipe(
      map(snapshot => {
        const polls = this.processPollSnapshot(snapshot);
        return polls
          .map(poll => ({
            ...poll,
            totalVotes: poll.results.reduce((sum, result) => sum + parseInt(result || '0'), 0)
          }))
          .sort((a, b) => b.totalVotes - a.totalVotes)
          .slice(0, limitCount);
      }),
      catchError(error => {
        console.error('Error fetching popular public polls:', error);
        return of([]);
      })
    );
  }
  getAllPublicPolls(): Observable<PollData[]> {
    const pollsRef = collection(this.firestore, 'polls');
    const allPublicQuery = query(
      pollsRef,
      where('isPublic', '==', true),
      orderBy('created', 'desc')
    );

    return from(getDocs(allPublicQuery)).pipe(
      map(snapshot => this.processPollSnapshot(snapshot)),
      catchError(error => {
        console.error('Error fetching all public polls:', error);
        return of([]);
      })
    );
  }

  getPollById(pollId: string): Observable<PollData | null> {
    const pollRef = doc(this.firestore, `polls/${pollId}`);

    return from(getDoc(pollRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return this.processPollData(docSnap.id, docSnap.data());
        } else {
          return null;
        }
      }),
      catchError(error => {
        console.error(`Error fetching poll with ID ${pollId}:`, error);
        return of(null);
      })
    );
  }

  submitVote(pollId: string, answerIndex: number): Observable<boolean> {
    const userEmail = this.getCurrentUserEmail();
    const isAuthenticated = !!userEmail;

    const pollRef = doc(this.firestore, `polls/${pollId}`) as DocumentReference<DocumentData>;

    return from(getDoc(pollRef)).pipe(
      switchMap(docSnap => {
        if (!docSnap.exists()) {
          return of(false);
        }

        const data = docSnap.data();
        const voted: string[] = data['voted'] || [];
        const answers: string[] = data['answers'] || [];
        let results: string[] = data['results'] || [];
        const isActive: boolean = data['isActive'] === true;
        const isPublic: boolean = data['isPublic'] === true;
        const voters: string[] = data['voters'] || [];

        if (!isActive) return of(false);

        // anonymous user voting
        if (!userEmail) {
          if (!isPublic) {
            return of(false);
          }

          if (answerIndex < 0 || answerIndex >= results.length) return of(false);
          results[answerIndex] = (parseInt(results[answerIndex] || '0') + 1).toString();

          return from(updateDoc(pollRef, { results })).pipe(
            map(() => true),
            catchError(error => {
              return of(false);
            })
          );
        }

        if (voted.includes(userEmail)) return of(false);

        const isAdmin = this.getCurrentUserRole() === 'admin';
        const canVote = this.canUserVoteOnPoll(
          {
            id: pollId,
            isActive,
            isPublic,
            voters
          } as PollData,
          userEmail,
          isAuthenticated,
          isAdmin
        );

        if (!canVote) {
          return of(false);
        }

        if (answerIndex < 0 || answerIndex >= results.length) {
          return of(false);
        }

        results[answerIndex] = (parseInt(results[answerIndex] || '0') + 1).toString();

        return from(updateDoc(pollRef, {
          results: results,
          voted: arrayUnion(userEmail)
        })).pipe(
          map(() => {
            return true;
          }),
          catchError(error => {
            return of(false);
          })
        );
      }),

      catchError(error => {
        return of(false);
      })
    );
  }

  getCurrentUserRole(): 'admin' | 'user' | null {
    const userData = JSON.parse(localStorage.getItem('user') || 'null');
    return userData?.role || null;
  }

  private processPollSnapshot(snapshot: QuerySnapshot<DocumentData>): PollData[] {
    return snapshot.docs.map(doc => {
      return this.processPollData(doc.id, doc.data());
    });
  }

  private processPollData(id: string, data: DocumentData): PollData {
    let created = data['created'];
    if (created && typeof created.toDate === 'function') {
      created = created.toDate();
    }

    let deadline = data['deadline'];
    if (deadline && typeof deadline.toDate === 'function') {
      deadline = deadline.toDate();
    } else if (deadline && typeof deadline === 'string') {
      deadline = new Date(deadline);
    } else if (!deadline) {
      deadline = new Date();
    }

    let startTime = data['startTime'];
    if (startTime && typeof startTime.toDate === 'function') {
      startTime = startTime.toDate();
    } else if (startTime && typeof startTime === 'string') {
      startTime = new Date(startTime);
    } else {
      startTime = created ?? new Date();
    }

    const pollData: PollData = {
      id: id,
      title: data['title'] || '',
      question: data['question'] || '',
      description: data['description'] || '',
      answers: data['answers'] || [],
      created: created,
      deadline: deadline,
      startTime: startTime,
      createdBy: data['createdBy'] || '',
      isActive: data['isActive'] === true,
      realtime: data['realtime'] === true,
      results: data['results'] || [],
      voters: data['voters'] || [],
      voted: data['voted'] || [],
      isPublic: data['isPublic'] === true
    };

    return pollData;
  }

  canUserViewPoll(poll: PollData, email: string | null, isAuthenticated: boolean): boolean {
    if (poll.isPublic) return true;

    if (!isAuthenticated) return false;

    if (!poll.voters || poll.voters.length === 0) return true;

    return !!email && poll.voters.includes(email);
  }

  canUserVoteOnPoll(poll: PollData, userEmail: string | null, isAuthenticated?: boolean, isAdmin: boolean = false): boolean {
    if (!poll) {
      return false;
    }

    if (poll.isPublic) {
      return true;
    }

    if (!isAuthenticated || !userEmail) {
      return false;
    }

    if (isAdmin) {
      return poll.voters.includes(userEmail!);
    }

    if (!poll.voters || poll.voters.length === 0) {
      return true;
    }

    const isListed = poll.voters.includes(userEmail);

    return isListed;
  }

  updatePoll(pollId: string, updatedData: Partial<PollData>) {
    const pollDoc = doc(this.firestore, 'polls', pollId);
    return from(updateDoc(pollDoc, updatedData));
  }

  deletePoll(pollId: string) {
    const pollRef = doc(this.firestore, 'polls', pollId);
    return deleteDoc(pollRef);
  }

  // Replace the existing getPrivatePolls method in your PollService with these two methods:

getPrivatePolls(): Observable<PollData[]> {
  // This method gets private polls with empty voters array (for general access)
  const pollsRef = collection(this.firestore, 'polls');
  const privateQuery = query(pollsRef, where('isPublic', '==', false));

  return from(getDocs(privateQuery)).pipe(
    map(snapshot => {
      const polls = this.processPollSnapshot(snapshot);
      return polls.filter(poll => !poll.voters || poll.voters.length === 0);
    }),
    catchError(error => {
      console.error('Error fetching private polls:', error);
      return of([]);
    })
  );
}

getAllPrivatePolls(userEmail: string | null): Observable<PollData[]> {
  // This method gets ALL private polls that the user can access
  if (!userEmail) {
    // If no email, only return private polls with empty voters
    return this.getPrivatePolls();
  }

  const pollsRef = collection(this.firestore, 'polls');
  const privateQuery = query(pollsRef, where('isPublic', '==', false));

  return from(getDocs(privateQuery)).pipe(
    map(snapshot => {
      const polls = this.processPollSnapshot(snapshot);
      return polls.filter(poll => {
        // Include polls with empty voters OR polls where user's email is in voters array
        const hasEmptyVoters = !poll.voters || poll.voters.length === 0;
        const userIsInVoters = poll.voters && poll.voters.includes(userEmail);
        return hasEmptyVoters || userIsInVoters;
      });
    }),
    catchError(error => {
      console.error('Error fetching all private polls:', error);
      return of([]);
    })
  );
}
}
