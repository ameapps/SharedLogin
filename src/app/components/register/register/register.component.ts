import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../../shared/models/user.model';
import { CommonService } from '../../../shared/services/common/common.service';
import { FirebaseService } from '../../../shared/services/firebase/firebase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  showPassword = false;
  user: User = new User();

  constructor(
    public common: CommonService,
    private fb_service: FirebaseService,
    private router: Router
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  /**Metodo per la registrazione dell'utente */
  async register() {
    try {
      this.common.lastRegisteredUser = this.user;
      if (!this.common.appConfig)
        this.common.appConfig = await this.common.loadAppConfig();
      await this.fb_service.addUser(this.user);
      const hasRegistred = await this.fb_service.tryLogin(this.user);
      if (hasRegistred) alert('Registrazione completata con successo!');
      else alert('Registrazione fallita. Riprova più tardi.');
      this.router.navigate(['/']);
    } catch (error) {
      console.error('Errore durante la registrazione:', error);
      // Gestisci l'errore di registrazione
      alert(
        'Si è verificato un errore durante la registrazione. Riprova più tardi.'
      );
    }
  }
}
