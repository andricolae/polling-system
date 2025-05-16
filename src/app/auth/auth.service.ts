import { Injectable } from "@angular/core";
import { Auth } from "@angular/fire/auth";
import { Firestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { logout } from "./auth.actions";


@Injectable({
    providedIn: 'root'
})

export class AuthService {
    constructor(private auth: Auth, private firestore: Firestore, private router: Router, private store: Store) { }

    logout() {
        this.store.dispatch(logout());

    }

}