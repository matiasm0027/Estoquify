import { PasswordStrengthDirective } from './password-strength.directive';
import { ElementRef, Renderer2 } from '@angular/core';

describe('PasswordStrengthDirective', () => {
  it('should create an instance', () => {
    const elMock: ElementRef = {} as ElementRef; // Simulación de ElementRef
    const rendererMock: Renderer2 = {} as Renderer2; // Simulación de Renderer2
    const directive = new PasswordStrengthDirective(elMock, rendererMock);
    expect(directive).toBeTruthy();
  });
});
