import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { EmployeesViewComponent } from './components/employees-view/employees-view.component';
import { FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ApiRequestService } from './services/api/api-request.service';
import { EmployeeDetailsComponent } from './components/employee-details/employee-details.component';
import { CategoriesViewComponent } from './components/categories-view/categories-view.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { CategoryDetailsComponent } from './components/category-details/category-details.component';
import { MaterialDetailsComponent } from './components/material-details/material-details.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { IncidenceHistoryComponent } from './components/incidences-history/incidences-history.component';
import { PasswordStrengthDirective } from './directivas/passwordRules/password-strength.directive';
import { UsuariosControlService } from './services/usuarios/usuarios-control.service';
import { IncidenceViewComponent } from './components/incidences-view/incidences-view.component';
import { FaqsComponent } from './components/faqs/faqs.component';
import { ChatViewComponent } from './components/chat-view/chat-view.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SidebarComponent,
    EmployeesViewComponent,
    EmployeeDetailsComponent,
    CategoriesViewComponent,
    CategoryDetailsComponent,
    ChangePasswordComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    MaterialDetailsComponent,
    IncidenceViewComponent,
    IncidenceHistoryComponent,
    PasswordStrengthDirective,
    FaqsComponent,
    ChatViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    NgSelectModule,
  ],
  exports: [
    PasswordStrengthDirective,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    ApiRequestService,
    UsuariosControlService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
