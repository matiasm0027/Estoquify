import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPasswordStrength]',
})
export class PasswordStrengthDirective {

  private errorMessageSpan: HTMLElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {
    this.errorMessageSpan = this.renderer.createElement('span');
    this.renderer.addClass(this.errorMessageSpan, 'error_form');
    this.renderer.addClass(this.errorMessageSpan, 'text-red-800'); // Añadimos la clase para el color rojo
    this.renderer.setStyle(this.errorMessageSpan, 'display', 'none');

    const parentElement = this.el.nativeElement.parentElement;
    this.renderer.insertBefore(parentElement, this.errorMessageSpan, this.el.nativeElement.nextSibling);
  }

  @HostListener('input', ['$event']) onInputChange(event: any) {
    const inputValue = event.target.value;

    if (inputValue.trim() === '') {
      this.hideErrorMessage(); // Oculta el mensaje de error si el campo está vacío
      return;
    }

    const numberRegex = /\d/;
    const uppercaseRegex = /[A-Z]/;
    let errorMessage = '';

    if (!numberRegex.test(inputValue)) {
      errorMessage += 'It must contain at least 1 number.';
    }
    if (!uppercaseRegex.test(inputValue)) {
      errorMessage += 'It must contain at least 1 capital letter.';
    }
    if (inputValue.length < 8) {
      errorMessage += 'It must be a minimum length of 8 characters.';
    }

    if (errorMessage !== '') {
      this.showErrorMessage(errorMessage);
    } else {
      this.hideErrorMessage();
    }
  }

  private showErrorMessage(message: string) {
    this.errorMessageSpan.innerText = message;
    this.renderer.setStyle(this.errorMessageSpan, 'display', 'inline-block');
  }

  private hideErrorMessage() {
    this.errorMessageSpan.innerText = '';
    this.renderer.setStyle(this.errorMessageSpan, 'display', 'none');
  }
}
