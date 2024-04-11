import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { EmployeesViewComponent } from './components/employees-view/employees-view.component';
import { FormsModule } from '@angular/forms';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent,
    SidebarComponent,
    EmployeesViewComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
