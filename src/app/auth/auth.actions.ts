import { createAction, props } from "@ngrx/store";

export const login = createAction('[Auth] Login', props<{ email: string; password: string }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ user: any }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());
export const initializeAuth = createAction('[Auth] Initialize Auth', props<{ user: any }>());
export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
export const signup = createAction('[Auth] Signup', props<{ email: string; password: string }>()
);
export const clearAuthError = createAction('[Auth] Clear Error');
