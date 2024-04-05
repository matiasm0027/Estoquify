import { Component } from '@angular/core';
import './custom.js';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UsuariosControlService } from '../../services/usuarios/usuarios-control.service';
import { PeticionesService } from '../../services/api/peticiones.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']

})
export class LoginComponent {
  login!: FormGroup;
  mensaje: string | null = null;
  
  // constructor(private authService: UsuariosControlService, private route: Router, private peticiones: PeticionesService) {
  //   //comprueba que el usuario ya este logeado
  //   if (this.authService.usuariData()) {
  //     this.route.navigate(['/home']);//si esta logeado redirecciona al home
  //   } else {
  //     //si no esta logueadop procede el formulario
  //     this.login = new FormGroup({
  //       email: new FormControl('', [
  //         Validators.required,
  //         Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  //       ]),
  //       password: new FormControl('', [
  //         Validators.required,
  //       ]),
  //     });
  //   }
  // }
}
