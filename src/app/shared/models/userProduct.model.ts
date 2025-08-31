export class UserProduct {
  /**Id del prodotto */
  id = '';
  /**Link al prodotto */
  link = '';
  /**Nome del prodotto */
  name = '';
  /**Descrizione del prodotto */
  description = '';
  /**Link all'immagine del prodotto (opzionale) */
  image?: string;
  /**Tags per filtrare i prodotti */
  tags: string[] = [];
}
