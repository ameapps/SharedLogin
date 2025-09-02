import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FirebaseService } from '../firebase/firebase.service';
import { lastValueFrom } from 'rxjs';
import { DefaultConfig } from '../../models/default.config.model';
import { FirebaseConfig } from '../../models/firebaseConfig';
import { CommonService } from '../common/common.service';
import { LoginService } from '../login/login.service';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  public hasAppInitialized = false;

  constructor(
    private common: CommonService,
    private login_service: LoginService,
    private fb_service: FirebaseService,
    private http_service: HttpClient
  ) { }

  async initApp(): Promise<void> {
    try {
      await this.getFirebaseInit();
      this.common.lastLoggedUser = this.common.getUserSession();
      this.common.appConfig = await this.common.loadAppConfig();
      const loginResult = await this.fb_service.tryLogin(this.common.lastLoggedUser);
      if (!loginResult) {
        console.error('Login fallito.');
        return;
      }
      await this.login_service.includeUserExtra(loginResult);
      this.hasAppInitialized = true;
    } catch (error) {
      console.error('Errore durante l\'inizializzazione dell\'app:', error);
      return;
    }
  }

  async getFirebaseInit(): Promise<void> {
    try {
      // 01. Recupero la configurazione Firebase
      const fbConfig: FirebaseConfig | undefined =
        await this.fb_service.getFirebaseConfig('ame.dev.apps');
      if (!fbConfig) {
        console.error('Errore nel recupero della configurazione Firebase.');
        return;
      }
      const fbApi: boolean = this.fb_service.startFbApi(fbConfig);
      if (!fbApi) {
        console.error("Errore nell'inizializzazione dell'API Firebase.");
        return;
      }
    } catch (error) {
      console.error('Errore durante l\'inizializzazione di Firebase:', error);
    }
  }
}
