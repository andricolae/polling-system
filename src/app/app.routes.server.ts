import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'vote/:pollId',
    renderMode: RenderMode.Client
  },
  {
    path: 'vote',
    renderMode: RenderMode.Client
  },
  {
    path: 'create',
    renderMode: RenderMode.Client
  },
  {
    path: 'admin-dashboard',
    renderMode: RenderMode.Client
  },
  {
    path: 'user-dashboard',
    renderMode: RenderMode.Client
  },
];
