import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EmployeesViewComponent } from './components/employees-view/employees-view.component';
import { MyGuardGuard } from './auth/my-guard.guard';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { CategoriesViewComponent } from './components/categories-view/categories-view.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [MyGuardGuard] },
  { path: 'employees_view', component: EmployeesViewComponent, canActivate: [MyGuardGuard] },
  { path: 'employees_details', component: EmployeeDetailsComponent, canActivate: [MyGuardGuard] },
  { path: 'employees_details/:id', component: EmployeeDetailsComponent, canActivate: [MyGuardGuard] },
  {path:  'categories_view', component: CategoriesViewComponent, canActivate: [MyGuardGuard]},
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  //en caso que no se ponga una url valida
  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
