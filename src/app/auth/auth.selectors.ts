import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AuthState } from "./auth.state";

export const selectAuthState = createFeatureSelector<AuthState>('auth');
export const selectIsAuthenticated = createSelector(
    selectAuthState,
    (state: AuthState) => state.isAuthenticated
);

export const selectAuthUser = createSelector(selectAuthState, (state: AuthState) => state.user);
export const selectAuthLoading = createSelector(selectAuthState, (state: AuthState) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state: AuthState) => state.error);
export const selectVerificationMessage = createSelector(selectAuthState,(state: AuthState) => state.verificationSent);
