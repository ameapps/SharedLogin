import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { UserProduct } from '../../../shared/models/userProduct.model';
import { CommonService } from '../../../shared/services/common/common.service';
import { Router } from '@angular/router';
import { FirebaseService } from '../../../shared/services/firebase/firebase.service';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit {
  products: UserProduct[] = [];

  // Filtro tag
  allTags: string[] = [];
  selectedTags: string[] = [];
  filteredProducts: UserProduct[] = [];

  constructor(
    public common: CommonService,
    private router: Router,
    private fb_service: FirebaseService
  ) {
    this.updateTags();
    this.filterProducts();
  }
  async ngOnInit(): Promise<void> {
    //01. Recupero quali sono i prodotti a cui l'utente ha accesso
    const allowedProds = await this.fb_service.getUserAllowedProducts(
      this.common.lastLoggedUser.uId
    );
    console.log('Allowed prods:', allowedProds);
    const allowedNames = allowedProds ? Object.keys(allowedProds) : [];
    //02. Recupero i suoi prodotti
    const products = await this.fb_service.getUserProducts(
      this.common.lastLoggedUser.uId,
      allowedNames
    );
    console.log('Prodotti utente:', products);
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
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter((p) =>
        p.tags?.some((t) => this.selectedTags.includes(t))
      );
    }
  }

  openProductLink(link: string) {
    window.open(link, '_blank');
  }

  addProduct() {
    this.router.navigate(['/products/add']);
  }
}
