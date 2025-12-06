import { Component } from '@angular/core';
import { CommonService } from '../../../shared/services/common/common.service';
import { User } from '../../../shared/models/user.model';

@Component({
  selector: 'app-forgot',
  standalone: true,
  imports: [],
  templateUrl: './forgot.component.html',
  styleUrl: './forgot.component.scss'
})
export class ForgotComponent {
  constructor(public common:CommonService) {}
  sendResetLink() {
    const email = (document.getElementById('email') as HTMLInputElement).value;
    if (!email) {
      alert('Inserisci un\'email valida.');
      return;
    }
    this.common.lastforgotPswRequest = {
      email: email,
      username: '',
      password: '',
      uId: '',
      sex: 'male',
      icon: '',
      role: 'user'
    };
    // Invia la richiesta di reset della password
    alert(`Link di reset inviato a ${email}`);
  }
}
