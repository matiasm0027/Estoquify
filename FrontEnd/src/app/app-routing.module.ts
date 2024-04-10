import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { EmployeeViewComponent } from './components/employee-view/employee-view.component';
import { MyGuardGuard } from './auth/my-guard.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, canActivate: [MyGuardGuard] },
  { path: 'employee_view', component: EmployeeViewComponent, canActivate: [MyGuardGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  //en caso que no se ponga una url valida
  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
