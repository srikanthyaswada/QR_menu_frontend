import { Routes } from '@angular/router';
import { AdminLoginComponent } from './admin-login/admin-login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminCategoryComponent } from './admin-category/admin-category.component';
import { MenuComponent } from './menu/menu.component';
import { UserComponent } from './user/user.component';
import { EventComponent } from './event/event.component';
import { QrComponent } from './qr/qr.component';

export const routes: Routes = [
  { path: '', component: AdminLoginComponent },
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    children: [
      { path: '', component: AdminCategoryComponent },
      { path: 'category', component: AdminCategoryComponent },
      { path: 'menu', component: MenuComponent },
      {path: 'event', component: EventComponent}, 
      {path: 'qr', component: QrComponent}
    ],
  },
  {path: 'user', component: UserComponent},
];
