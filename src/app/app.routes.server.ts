import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'home',
    renderMode: RenderMode.Client
  },
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'all-polls',
    renderMode: RenderMode.Client
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
  {
    path: '404',
    renderMode: RenderMode.Client
  },
];
