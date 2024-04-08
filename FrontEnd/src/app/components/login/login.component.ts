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
  errorApi: string | null = null;
  
  constructor(private authService: UsuariosControlService, private route: Router, private peticiones: PeticionesService) {
    //comprueba que el usuario ya este logeado
    if (this.authService.usuariData()) {
      this.route.navigate(['/home']);//si esta logeado redirecciona al home
    } else {
      //si no esta logueadop procede el formulario
      this.login = new FormGroup({
        email: new FormControl('', [
          Validators.required,
          Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
        ]),
        password: new FormControl('', [
          Validators.required,
        ]),
      });
    }
  }

   //funcion que envia los datos del usuario para validar login
   enviarLogin(): void {
    const email = this.login.value.email;
    const password = this.login.value.password;
    // Llamada al servicio para autenticar al usuario
    this.peticiones.login(email, password).subscribe(
      (response: any) => {
        // Si la autenticación es exitosa, redirige al usuario a la página de inicio
        this.authService.validarLogin(email);
        this.route.navigate(['/home']);
      },
      (error: any) => {
        // Verificar si el error es debido a una contraseña incorrecta o un correo electrónico inexistente
        // this.peticiones.verificarCampo('email', email).subscribe(
        //   (respuesta) => {
        //     // Aquí puedes manejar la respuesta exitosa del servidor
        //     this.mensaje = respuesta.message ;
        //   },
        //   (verificacionError) => {
        //     // Aquí puedes manejar los errores de la solicitud HTTP
        //     console.error('Error al verificar campo:', verificacionError);
        //     if (verificacionError.status === 400) {
        //       this.errorApi = verificacionError.error.error ;
        //     } else if (verificacionError.status === 409) {
        //       this.errorApi = verificacionError.error.error ;
        //     } else {
        //       this.errorApi = verificacionError.error.error ;
        //     }
        //   }
        // );
      }
    );
  }
}
