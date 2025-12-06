import { Injectable } from '@angular/core';
import { CommonService } from '../common/common.service';
import { FirebaseService } from '../firebase/firebase.service';
import { User } from '../../models/user.model';
import { UserCredential } from '@firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  user: User = {
    username: '',
    email: '',
    password: '',
    uId: '',
    sex: 'male',
    icon: '',
    role: 'user'
  };
  error = '';
  showPassword = false;

  constructor(
    public common: CommonService,
    private fb_service: FirebaseService) { }

  async onSubmit() {
    try {
      if (!this.user.email || !this.user.password) {
        this.error = 'Inserisci nome utente e password.';
        return;
      }
      this.common.lastLoggedUser = this.user;
      this.error = '';
      //01. Tento il login con le credenziali fornite
      const loginResult = await this.fb_service.tryLogin(this.user);
      console.info('Credenziali Firebase:', loginResult);
      if (!loginResult) {
        this.error = 'Credenziali non valide. Riprova.';
        return;
      }
      //02. Imposto le credenziali dell'utente appena ricevute 
      this.common.lastLoggedUser.uId = loginResult.user.uid;
      this.common.lastLoggedUser.username = this.user.username;
      this.common.lastLoggedUser.email = loginResult.user.email || '';
      this.common.lastLoggedUser.jwt =  await loginResult.user.getIdToken();
      await this.includeUserExtra(loginResult);
      console.log('this.common.lastLoggedUser', this.common.lastLoggedUser);
      //03. Salvo la sessione dell'utente
      this.common.saveUserSession();
    } catch (error) {
      console.error('Errore durante il login:', error);
    }
  }

  public async includeUserExtra(loginResult: UserCredential | undefined): Promise<void> {
    if (!loginResult) return;
    const userInfo = await this.fb_service.getUserExtras(loginResult.user.uid);
    if (!userInfo) return;
    if (!this.common.lastLoggedUser) return;
    //03. Integro le info nei dati utente
    this.common.lastLoggedUser.sex = userInfo?.sex ?? 'male';
    this.common.lastLoggedUser.icon = userInfo?.icon ?? (userInfo?.sex === 'male' ? 'man-default' : 'woman-default');
    this.common.lastLoggedUser.username = userInfo?.username ?? this.user.username;
  }
}
