import { FirebaseApp, FirebaseOptions, initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  child,
  update,
  Database,
  onValue,
} from 'firebase/database';
import { getApps } from 'firebase/app';
import { UserProduct } from '../models/userProduct.model';

export class FirebaseHelper {

  private static apps: Map<string, FirebaseApp> = new Map();

  /** Legge dati da un percorso del DB */
  static async getData(
    app: FirebaseApp,
    path: string,
    dbUrl?: string
  ): Promise<any> {
    try {
      // Se dbUrl è fornito, lo passo a getDatabase, altrimenti uso il default
      const db: Database = dbUrl ? getDatabase(app, dbUrl) : getDatabase(app);
      const dbData = await FirebaseHelper.getDbData(db, path);
      return dbData;
    } catch (error) {
      console.error('Errore nel recupero dei dati Firebase:', error);
      return null;
    }
  }

  /** Method getting the data available at the specified path using the specified database. */
  private static async getDbData(db: Database, path: any) {
    const starCountRef = ref(db, path);
    const prom = new Promise((resolve, reject) => {
      onValue(
        starCountRef,
        (snapshot) => {
          const data = snapshot.val();
          resolve(data);
        },
        (error) => {
          reject(error);
        }
      );
    });
    return prom;
  }

  /** Scrive un oggetto sostituendo quello esistente */
  static async writeUserData(
    objToUpload: object,
    app: FirebaseApp,
    path: string,
    dbUrl?: string
  ): Promise<void> {
    // Se dbUrl è fornito, lo passo a getDatabase, altrimenti uso il default
    const db: Database = dbUrl ? getDatabase(app, dbUrl) : getDatabase(app);
    await set(ref(db, path), objToUpload);
  }

  /**
 * Aggiorna solo le proprietà specificate di un oggetto al path dato.
 * Se la property non esiste, viene creata nuova.
 */
  static async addOrUpdateProperties(
    app: FirebaseApp,
    path: string,
    propsToUpdate: any,
    dbUrl?: string
  ): Promise<void> {
    try {
      // Se dbUrl è fornito, lo passo a getDatabase, altrimenti uso il default
      const db: Database = dbUrl ? getDatabase(app, dbUrl) : getDatabase(app);

      // Prepara il payload per l'update
      const updates: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(propsToUpdate)) {
        updates[`${path}/${key}`] = value;
      }

      await update(ref(db), updates);
      console.log(`Aggiornato nodo "${path}" con:`, propsToUpdate);
    } catch (error) {
      console.error(`Errore nell'aggiornamento di "${path}":`, error);
      throw error;
    }
  }


  /**
   * Aggiunge un elemento a un nodo senza sovrascrivere tutto
   * (senza dipendere da altri metodi interni)
   */
  static async pushToChild(
    data: Record<string, unknown>,
    credentials: FirebaseOptions,
    path: string,
    postKeyType: 'NUMBER' | 'RANDOM' = 'RANDOM'
  ): Promise<void> {
    try {
      const app = initializeApp(credentials);
      const db = getDatabase(app);

      let newKey: string | null = null;

      if (postKeyType === 'RANDOM') {
        // Genera chiave casuale
        newKey = push(ref(db, path)).key;
      } else if (postKeyType === 'NUMBER') {
        // Genera chiave numerica sequenziale
        const snapshot = await get(ref(db, path));
        const currentData = snapshot.exists() ? snapshot.val() : {};
        const nextNumber = Object.keys(currentData).length + 1;
        newKey = String(nextNumber);
      }

      if (!newKey) {
        throw new Error('Impossibile generare una nuova chiave.');
      }

      // Aggiorna solo il nodo specifico
      const updates: Record<string, unknown> = {
        [`${path}/${newKey}`]: data,
      };

      await update(ref(db), updates);
      console.log(`Elemento aggiunto a "${path}" con chiave "${newKey}"`);
    } catch (error) {
      console.error(`Errore in pushToChild(${path}):`, error);
      throw error;
    }
  }
}
