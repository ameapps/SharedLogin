import { Injectable } from '@angular/core';
import { UserProduct } from '../../models/userProduct.model';
import { CommonService } from '../common/common.service';
import { DefaultConfigShow_OpenMode } from '../../models/default.config.model';

@Injectable({
  providedIn: 'root'
})
export class OpenProductService {

  get openType(): DefaultConfigShow_OpenMode {
    return this.common.appConfig.products.show.open_mode;
  }

  constructor(private common: CommonService,) { }
  
  public openProductLink(product: UserProduct) {
    try {
      console.log('Opening product link with method:', this.openType);
      if (this.openType === 'direct_link')  window.open(product.link, '_blank');
      if (this.openType === 'uId_in_querystring') {
        const uId = this.common.lastLoggedUser?.uId ?? '';
        const uIdLink = `${product.link}?user=${uId}`;
        window.open(uIdLink, '_blank');
      }
      if (this.openType === 'uId_in_post_message') {
        //TODO: inviare il token JWT tramite postMessage al sito esterno
        console.warn('Open product via JWT in post message is not implemented yet.');
      }
    } catch (error) {
      console.error('Error opening product link:', error);
    }
  }
}
