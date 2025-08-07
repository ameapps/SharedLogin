import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'shared-login';
  username = '';
  password = '';
  error = '';

  onSubmit() {
    if (!this.username || !this.password) {
      this.error = 'Inserisci nome utente e password.';
      return;
    }
    this.error = '';
    // Qui puoi aggiungere la logica di autenticazione
    alert(`Benvenuto, ${this.username}!`);
  }
}
