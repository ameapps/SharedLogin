import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../../shared/models/user.model';
import { CommonService } from '../../shared/services/common/common.service';
import { FirebaseService } from '../../shared/services/firebase/firebase.service';
import { LoginService } from '../../shared/services/login/login.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {

  constructor(
    public login_service: LoginService,
    private router: Router,
  ) {}

  togglePasswordVisibility() {
    this.login_service.showPassword = !this.login_service.showPassword;
  }

  async onSubmit() {
    await this.login_service.onSubmit();
    //04. Accedo alla pagina dei prodotti
    this.router.navigate(['/products']);
  }

  forgotPassword() {
    this.router.navigate(['/forgot']);
  }

  register() {
    this.router.navigate(['/register']);
  }
}
