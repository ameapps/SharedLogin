import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserProduct } from '../../../shared/models/userProduct.model';
import { CommonService } from '../../../shared/services/common/common.service';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase/firebase.service';
import { AppService } from '../../../shared/services/app/app.service';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { OpenProductService } from '../../../shared/services/openProduct/open-product.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, MatCardModule, LoaderComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: UserProduct[] = [];
  allTags: string[] = [];
  selectedTags: string[] = [];
  filteredProducts: UserProduct[] = [];
  canShowLoader = false;

  constructor(
    public common: CommonService,
    private app_service: AppService,
    private router: Router,
    private fb_service: FirebaseService,
    private open_prod: OpenProductService,
    private cdRef: ChangeDetectorRef
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.app_service.hasAppInitialized) await this.app_service.initApp();
    //01. Recupero quali sono i prodotti a cui l'utente ha accesso
    this.canShowLoader = true;
    await this.getUserProduct();
    //02. Aggiorno i tag e filtro i prodotti
    this.updateTags();
    this.filterProducts();
    this.cdRef.detectChanges();
    this.canShowLoader = false;
    console.log('Prodotti utente:', this.products);
  }

  private async getUserProduct(): Promise<void> {
    try {
      const allowedNames = await this.fb_service.getUserAllowedProducts(
        this.common.lastLoggedUser?.uId ?? ''
      );
      //02. Recupero i suoi prodotti
      const products = await this.fb_service.getUserProducts(
        this.common.lastLoggedUser?.uId ?? '',
        allowedNames ?? []
      );
      this.products = Object.values(products || {}) as UserProduct[];
    } catch (error) {
      console.error('error getting products', error)
    }
  }

  updateTags() {
    const tagsSet = new Set<string>();
    this.products.forEach((p) => p.tags?.forEach((t) => tagsSet.add(t)));
    this.allTags = Array.from(tagsSet);
  }

  toggleTag(tag: string) {
    if (this.selectedTags.includes(tag)) {
      this.selectedTags = this.selectedTags.filter((t) => t !== tag);
    } else {
      this.selectedTags.push(tag);
    }
    this.filterProducts();
  }

  filterProducts() {
    if (this.selectedTags.length === 0) {
      this.filteredProducts = this.products.map(p => ({ ...p }));
    } else {
      this.filteredProducts = this.products.filter((p) =>
        p.tags?.some((t) => this.selectedTags.includes(t))
      );
    }
  }

  openProductLink(product: UserProduct): void {
    if (product?.link === null) {
      console.warn('No selected project');
      return;
    }
    this.open_prod.openProductLink(product);
  }

  addProduct(): void {
    this.common.selectedProduct = new UserProduct();
    console.log('adding product')
    this.router.navigate(['/products/add']);
  }

  editProduct($event: any, product: UserProduct) {
    $event.stopPropagation();
    this.common.selectedProduct = { ...product };
    this.router.navigate(['/products/edit']);
  }

  async deleteProduct($event: any, product: UserProduct) {
    $event.stopPropagation();
    const hasAccepted = confirm(`Sei sicuro di voler eliminare il prodotto "${product.name}"?`);
    if (!hasAccepted) return;
    let hasDeleted = false;
    const isDisableAllowed = true;
    if (isDisableAllowed) hasDeleted = await this.fb_service.deleteProduct(product);
    else hasDeleted = await this.fb_service.disableUserProduct(product);
    if (hasDeleted) {
      this.canShowLoader = true;
      setTimeout(async () => {
        await this.getUserProduct();
        this.updateTags();
        this.filterProducts();
        this.cdRef.detectChanges();
        this.canShowLoader = false;
      }, 100);
    }
  }

  editProfile() {
    this.router.navigate(['/user/edit']);
  }

  addProfile() {
    this.router.navigate(['/user/add']);
  }

  async deleteProfile() {
    // Logica per eliminazione profilo (es. conferma)
    if (confirm('Sei sicuro di voler eliminare il profilo?')) {
      if (this.common.lastLoggedUser == null) {
        console.error('Nessun utente loggato');
        return;
      }
      const hasDeleted = await this.fb_service.deleteUser(this.common.lastLoggedUser);
      if (hasDeleted) {
        this.common.lastLoggedUser = undefined;
        localStorage.removeItem('lastLoggedUser');
        this.router.navigate(['/']);
      }
    }
  }

  logout() {
    if (confirm('Sei sicuro di voler effettuare il logout?')) {
      this.common.lastLoggedUser = undefined;
      localStorage.removeItem('lastLoggedUser');
      this.router.navigate(['/']);
    }
  }
}
