import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EmployeesViewComponent } from './components/employees-view/employees-view.component';
import { MyGuardGuard } from './auth/my-guard.guard';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { CategoriesViewComponent } from './components/categories-view/categories-view.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ChangePasswordGuard } from './changePassword/change-password.guard';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CategoryDetailsComponent } from './components/category-details/category-details.component';
import { MaterialDetailsComponent } from './components/material-details/material-details.component';
import { ReportesViewComponent } from './components/reportes-view/reportes-view.component';
import { ReportesHistoryComponent } from './components/reportes-history/reportes-history.component';
import { FaqsComponent } from './components/faqs/faqs.component';
import { ChatViewComponent } from './components/chat-view/chat-view.component';


const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'forgot_password', component: ForgotPasswordComponent, canActivate: [ChangePasswordGuard]},
  { path: 'reset_password', component: ResetPasswordComponent, canActivate: [ChangePasswordGuard]},
  { path: 'home', component: HomeComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ]},
  { path: 'employees_view', component: EmployeesViewComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ] },
  { path: 'employees_details', component: EmployeeDetailsComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ] },
  { path: 'employees_details/:id', component: EmployeeDetailsComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ] },
  { path: 'categories_view', component: CategoriesViewComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ]},
  { path: 'categories_details', component: CategoryDetailsComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ]},
  { path: 'categories_details/:id', component: CategoryDetailsComponent, canActivate: [MyGuardGuard, ChangePasswordGuard ]},
  { path: 'change_password', component: ChangePasswordComponent, canActivate: [MyGuardGuard, ]},
  { path: 'material_details/:id', component: MaterialDetailsComponent, canActivate: [MyGuardGuard, ]},
  { path: 'reportes_view', component: ReportesViewComponent, canActivate: [MyGuardGuard, ]},
  { path: 'reportes_history', component: ReportesHistoryComponent, canActivate: [MyGuardGuard, ]},
  { path: 'faqs', component: FaqsComponent, canActivate:[MyGuardGuard]},
  { path: 'chat', component: ChatViewComponent, canActivate:[MyGuardGuard]},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
