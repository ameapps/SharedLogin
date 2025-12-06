import { Injectable } from '@angular/core';
import { FirebaseConfig } from '../../models/firebaseConfig';
import { AssetsService } from '../assets/assets.service';
import { CommonService } from '../common/common.service';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { User } from '../../models/user.model';

import {
  getAuth,
  signInWithEmailAndPassword,
  UserCredential,
} from 'firebase/auth';
import { FirebaseHelper } from '../../helpers/firebaseHelper';
import { getDatabase, ref, get } from 'firebase/database';
import { UserExtras } from '../../models/user.extras.model';
import { UserProduct } from '../../models/userProduct.model';
import { generateUUIDv4 } from '../../helpers/stringHelper.model';
import { FirebaseUser, FirebaseUserAuth, FirebaseUserInfo } from '../../models/firebase.user.model';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  constructor(
    private common_service: CommonService,
    private assets_service: AssetsService
  ) {}

  // #region helpers

  /**Metodo che inizializza la connessione con firebase */
  startFbApi(fbConfig: FirebaseConfig): boolean {
    try {
      this.common_service.fbApp = initializeApp(fbConfig as any);
      this.common_service.fbApiAnalytics = getAnalytics(
        this.common_service.fbApp
      );
      console.log('API Firebase inizializzata con successo.');
      return true;
    } catch (error) {
      console.error("Errore nell'inizializzazione dell'API Firebase:", error);
      return false;
    }
  }

  /**Metodo che contatta firebase per sapere se le credenziali inserite sono corrette o meno */
  async tryLogin(user: User): Promise<UserCredential | undefined> {
    try {
      const auth = getAuth(this.common_service.fbApp);
      const result = await signInWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );
      // Se tutti ok, chiedo dati utente
      //TODO: chiedere a FB dati utente
      return result;
    } catch (error) {
      console.error('Errore durante il tentativo di login:', error);
      return undefined;
    }
  }

  /**Metodo che recupera le credenziali Firebase dell'utente specificato */
  public async getFirebaseConfig(
    username: string
  ): Promise<FirebaseConfig | undefined> {
    try {
      const fbConfig = await this.assets_service.getFile(
        'assets/firebase/fb-proj-configs.json'
      );
      if (!fbConfig) {
        console.error('Impossibile caricare la configurazione Firebase.');
        return;
      }
      const fbUserConfig: FirebaseConfig = fbConfig['users'][username];
      if (!fbUserConfig) {
        console.error(
          `Configurazione Firebase non trovata per l'utente: ${username}`
        );
        return;
      }
      this.common_service.fbUserConfig = fbUserConfig;
      return fbUserConfig;
    } catch (error) {
      console.error(
        'Errore nel recupero della configurazione Firebase:',
        error
      );
      return;
    }
  }

  // #endregion

  // #region PRODUCTS

  /**Metodo che recupera le info aggiuntive sull'utente dal db, che firebase NON passa per default */
  async getUserExtras(uid: string): Promise<UserExtras | undefined> {
    try {
      //01. Controlli
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return undefined;
      }
      //02. Recupero le info extra
      const userInfo = (await FirebaseHelper.getData(
        this.common_service.fbApp!,
        `users/list/${uid}/info`,
        this.common_service.appConfig.firebase.dbUrl || ''
      )) as UserExtras;

      return userInfo;
    } catch (error) {
      console.error("Errore nel recupero delle info dell'utente:", error);
      return undefined;
    }
  }

  /**Metodo che recupera i prodotti di un utente dal real time DB di Firebase */
  async getUserAllowedProducts(uid: string): Promise<string[] | null> {
    try {
      console.log(`Recupero prodotti per l'utente: ${uid}`);
      //01. Controlli
      if (!uid) {
        console.error(
          'Nessun nome utente fornito per il recupero dei prodotti.'
        );
        return null;
      }
      if (this.common_service.fbApp == null) {
        console.error('API Firebase non inizializzata.');
        return null;
      }
      //02. Recupero i prodotti dell'utente
      const allowedProds = await FirebaseHelper.getData(
        this.common_service.fbApp,
        `users/list/${uid}/auth/allowedProds`,
        this.common_service.appConfig.firebase.dbUrl || ''
      );
      console.info(`Prodotti recuperati per l'utente ${uid}:`, allowedProds);
      // Filtra solo le chiavi con valore true
      const allowedNames = allowedProds
        ? Object.entries(allowedProds)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
        : [];

      return allowedNames;
    } catch (error) {
      console.error(
        `Errore nel recupero dei prodotti per l'utente ${uid}:`,
        error
      );
      return null;
    }
  }

  /**metodo che imposta a false la property relativa al prodotto per l'utente loggato */
  async disableUserProduct(product: UserProduct): Promise<boolean> {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return false;
      }
      const uid = this.common_service.lastLoggedUser?.uId;
      if (!uid) {
        console.error('Utente non trovato.');
        return false;
      }
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      await FirebaseHelper.addOrUpdateProperties(
        this.common_service.fbApp,
        `users/list/${uid}/auth/allowedProds`,
        { [product.id]: false },
        dbUrl
      );
      return true;
    } catch (error) {
      return false;
    }
  }

  /**Metodo che elimina il prodotto da firebase ed anche tutti i suoi riferimenti */
  async deleteProduct(product: UserProduct): Promise<boolean> {
    try {
      //01. controlli
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return false;
      }
      const uid = this.common_service.lastLoggedUser?.uId;
      if (!uid) {
        console.error('Utente non trovato.');
        return false;
      }
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      //02. elimino il prodotto fisicamente dal db
      await FirebaseHelper.deleteData(
        this.common_service.fbApp,
        `sharedLogin/products/list/${product.id}`,
        dbUrl
      );
      //03. elimino il riferimento al prodotto da product/all_ids
      await FirebaseHelper.deleteProperties(
        this.common_service.fbApp,
        `sharedLogin/products/all_ids`,
        [`${product.id}`],
        dbUrl
      );
      //04. Elimino tutti i riferimenti del prodotto da eachUser/allowedProds
      const allUsersId = await this.getAllUsersId();
      for (const user of allUsersId) {
        FirebaseHelper.deleteProperties(
          this.common_service.fbApp!,
          `users/list/${user}/auth/allowedProds`,
          [`${product.id}`],
          dbUrl
        );
      }

      return true;
    } catch (error) {
      console.error("Errore nell'eliminazione del prodotto:", error);
      return false;
    }
  }

  async getUserProducts(uid: string, allowedProds: string[]) {
    try {
      console.info('Recupero prodotti utente...');
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return;
      }
      //02. Recupero i prodotti dell'utente
      const result: any = {};
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      for (const prodName of allowedProds) {
        if (!this.common_service.fbApp) {
          console.error('API Firebase non inizializzata.');
          return;
        }
        const data = await FirebaseHelper.getData(
          this.common_service.fbApp,
          `sharedLogin/products/list/${prodName}`,
          this.common_service.appConfig.firebase.dbUrl || ''
        );
        result[prodName] = data;
      }
      console.info(`Prodotti recuperati`, result);

      return result;
    } catch (error) {
      console.error("Errore nel recupero dei prodotti dell'utente:", error);
      return [];
    }
  }

  /**Metodo per la creazione di un prodotto su firebase */
  async createProduct(selectedProduct: UserProduct): Promise<boolean> {
    try {
      //01. controlli
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return false;
      }
      //02. salvataggio prodotto
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      selectedProduct.id = await this.createProductId(selectedProduct);
      await FirebaseHelper.writeUserData(
        selectedProduct,
        this.common_service.fbApp,
        `sharedLogin/products/list/${selectedProduct.id}`,
        dbUrl
      );
      //03. salvataggio id prodotto creato
      await FirebaseHelper.addOrUpdateProperties(
        this.common_service.fbApp,
        `sharedLogin/products/all_ids`,
        { [selectedProduct.id]: true },
        dbUrl
      );
      //03. aggiungo il riferimento al prodotto da product/all_ids
      await FirebaseHelper.addOrUpdateProperties(
        this.common_service.fbApp,
        `sharedLogin/products/all_ids`,
        { [selectedProduct.id]: true },
        dbUrl
      );
      //04. aggiungo il riferimento al prodotto ad ogni User/allowedProds
      const allUsersId = await this.getAllUsersId();
      for (const user of allUsersId) {
        const canShowProd = user === this.common_service.lastLoggedUser?.uId;
        FirebaseHelper.addOrUpdateProperties(
          this.common_service.fbApp!,
          `users/list/${user}/auth/allowedProds`,
          { [selectedProduct.id]: canShowProd },
          dbUrl
        );
      }
      console.info(`Prodotto creato`, selectedProduct);

      return true;
    } catch (error) {
      console.error('Errore nella creazione del prodotto:', error);
      return false;
    }
  }

  /**Metodo che recupera tutti i prodotti del sito */
  async getAllProdsId(): Promise<string[]> {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return [];
      }
      const allProds = await FirebaseHelper.getData(
        this.common_service.fbApp,
        `sharedLogin/products/all_ids`,
        this.common_service.appConfig.firebase.dbUrl || ''
      );
      const keys = Object.keys(allProds) ?? [];

      return keys;
    } catch (error) {
      console.error('could not get the list of all the products');
      return [];
    }
  }

  /**Metodo per la creazione di un ID univoco per il prodotto */
  async createProductId(selectedProduct: UserProduct): Promise<string> {
    try {
      //01. controlli
      if (selectedProduct == null) {
        return '';
      }
      //02. creo l'id con numero progressivo se già esistente
      const allProdsId = await this.getAllProdsId();
      console.log('Tutti gli ID dei prodotti esistenti:', allProdsId);
      let builtId = selectedProduct.name.toLowerCase().replace(' ', '_');
      if (allProdsId.includes(builtId)) {
        const sameProds = allProdsId.filter((prod) => prod.includes(builtId));
        const next = sameProds.length + 1;
        builtId = `${builtId}_${next}`;
      }

      return builtId;
    } catch (error) {
      console.error('Cannot make product id');
      return '';
    }
  }

  async editProduct(selectedProduct: UserProduct) {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return;
      }
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      await FirebaseHelper.addOrUpdateProperties(
        this.common_service.fbApp,
        `sharedLogin/products/list/${selectedProduct.id}`,
        selectedProduct,
        dbUrl
      );

      console.info(`Prodotto modificato`, selectedProduct);
    } catch (error) {
      console.error('Errore nella modifica del prodotto:', error);
    }
  }
  // #endregion

  // #REGION USERS

  /**Metodo che recupera tutti i prodotti del sito */
  async getAllUsersId(): Promise<string[]> {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return [];
      }
      const allUsers = await FirebaseHelper.getData(
        this.common_service.fbApp,
        `users/all_ids`,
        this.common_service.appConfig.firebase.dbUrl || ''
      );
      const keys = Object.keys(allUsers) ?? [];

      return keys;
    } catch (error) {
      console.error('could not get the list of all the users');
      return [];
    }
  }

  /**Metodo per aggiungere un nuovo utente */
  async addUser(user: User) {
    //01. Controlli 
    if (!this.common_service.fbApp) {
      console.error('API Firebase non inizializzata.');
      return;
    }
    const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
    //02. Creo l'utente in firebase authentication 
    const fbUserInfo = await FirebaseHelper.createFirebaseUser(this.common_service.fbApp, user.email, user.password);
    user.uId = fbUserInfo.user.uid;
    console.log('Utente creato in Firebase Authentication:', fbUserInfo);
    //04. Salvo le info dell'utente al db di firebase
    const fbUser = new FirebaseUser();
    fbUser.auth = new FirebaseUserAuth();
    fbUser.auth.role = user.role;
    const allProds = await this.getAllProdsId();
    const allProdsObj: any = {};
    allProds.forEach(element => {
      allProdsObj[element] = false;  
    });
    fbUser.auth.allowedProds = allProdsObj ?? {};
    fbUser.info = new FirebaseUserInfo(
      user.icon,
      user.sex ?? 'male',
      user.username
    );
    await FirebaseHelper.writeUserData(
      fbUser,
      this.common_service.fbApp,
      `users/list/${user.uId}`,
      dbUrl
    );
    //04. Aggiungo l'id utente in all_ids
    await FirebaseHelper.addOrUpdateProperties(
      this.common_service.fbApp,
      `users/all_ids`,
      { [user.uId]: true },
      dbUrl
    );
  }

  /** Modifica le informazioni dell'utente. */
  async editUser(user: User) {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return;
      }
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      //01. Aggiorno le informazioni dell'utente
      const userInfo: FirebaseUserInfo = {
        icon: user.icon,
        sex: user.sex ?? 'male',
        username: user.username
      };
      await FirebaseHelper.addOrUpdateProperties(
        this.common_service.fbApp,
        `users/list/${user.uId}/info`,
        userInfo,
        dbUrl
      );
      //02. Se è stata cambiata la mail, aggiorno anche quella
      const hasEmailChanged = true; //TODO: implementare controllo\
      if (hasEmailChanged) await FirebaseHelper.changeCurrentUserEmail(user.email); //TODO: finire
      console.info(`Utente modificato`, user);
    } catch (error) {
      console.error('Errore nella modifica dell\'utente:', error);
    }
  }

  async deleteUser(user: User): Promise<boolean> {
    try {
      if (!this.common_service.fbApp) {
        console.error('API Firebase non inizializzata.');
        return false;
      }
      const dbUrl = this.common_service.appConfig.firebase.dbUrl || '';
      await FirebaseHelper.deleteProperties(
        this.common_service.fbApp,
        `users/all_ids`,
        [user.uId],
        dbUrl
      );
      await FirebaseHelper.deleteCurrentUser();
      console.info(`Utente eliminato`, user);
      return true;
    } catch (error) {
      console.error('Errore nella eliminazione dell\'utente:', error);
      return false;
    }
  }

  // #REGION USERS
}
