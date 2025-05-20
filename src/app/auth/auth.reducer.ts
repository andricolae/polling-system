import { createReducer, on } from "@ngrx/store";
import { login, loginSuccess, loginFailure, logoutSuccess, clearAuthError } from "./auth.actions";
import { AuthState, initialAuthState } from "./auth.state";

export const authReducer = createReducer(
  initialAuthState,
  on(login, state => ({ ...state, loading: true, error: null })),
  on(loginSuccess, (state, { user }) => ({
    ...state,
    isAuthenticated: true,
    user,
    loading: false
  })),
  on(loginFailure, (state, { error }) => ({
    ...state,
    isAuthenticated: false,
    user: null,
    loading: false,
    error
  })),
  on(logoutSuccess, state => ({
    ...state,
    isAuthenticated: false,
    user: null
  })),
  on(clearAuthError, state => ({ ...state, error: null }))
);