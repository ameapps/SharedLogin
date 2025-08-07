import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(private router: Router) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Inserisci nome utente e password.';
      return;
    }
    this.error = '';
    // La logica di navigazione sarà gestita dal componente principale
    this.router.navigate(['/products']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}
