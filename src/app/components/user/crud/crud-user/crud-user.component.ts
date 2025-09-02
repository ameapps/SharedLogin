import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../shared/services/common/common.service';
import { User } from '../../../../shared/models/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../../shared/services/firebase/firebase.service';
import { LoginService } from '../../../../shared/services/login/login.service';

@Component({
  selector: 'app-crud-user',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crud-user.component.html',
  styleUrl: './crud-user.component.scss',
})
export class CrudUserComponent implements OnInit {
  user: User = new User();
  pageTitle = 'Aggiungi nuovo utente';
  success = false;
  showPassword = false;

  constructor(
    public common: CommonService,
    private route: ActivatedRoute,
    private router: Router,
    private firebase_service: FirebaseService,
    public login_service: LoginService
  ) {}

  ngOnInit() {
    if (this.router.url.includes('/user/edit')) {
      this.pageTitle = 'Modifica utente';
      if (this.common.lastLoggedUser) {
        // Copia i dati dell'utente loggato
        this.user = { ...this.common.lastLoggedUser };
      }
    }
  }

  async onSubmit() {
    // Salvataggio o aggiornamento dell'utente
    if (this.pageTitle === 'Aggiungi nuovo utente') {
      if (!this.common.appConfig)
        this.common.appConfig = await this.common.loadAppConfig();
      await this.firebase_service.addUser(this.user);
      this.router.navigate(['/']);
      console.log('Nuovo utente:', this.user);
    } else {
      // Logica per modifica utente
      this.common.lastLoggedUser = { ...this.user };
      await this.firebase_service.editUser(this.user);
      this.common.saveUserSession();
      console.log('Utente modificato:', this.user);
    }
    this.success = true;
    setTimeout(() => (this.success = false), 2000);
  }

  togglePasswordVisibility() {
  this.showPassword = !this.showPassword;
  }
}
