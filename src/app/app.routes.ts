import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'brag-bot | Pós IA UNIPDS'
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./components/details/details.component').then(m => m.DetailsComponent),
    title: 'Detalhes da Conquista | brag-bot'
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];