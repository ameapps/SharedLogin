import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserProduct } from '../../../../shared/models/userProduct.model';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent {
  product: UserProduct = new UserProduct();
  success = false;

  // Tag di default
  defaultTags: string[] = ['gioco', 'app'];
  selectedTags: string[] = [];
  customTag: string = '';

  toggleDefaultTag(tag: string, event: any) {
    if (event.target.checked) {
      if (!this.selectedTags.includes(tag)) {
        this.selectedTags.push(tag);
      }
    } else {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    }
  }

  addCustomTag() {
    const tag = this.customTag.trim();
    if (tag && !this.selectedTags.includes(tag)) {
      this.selectedTags.push(tag);
      this.customTag = '';
    }
  }

  removeTag(tag: string) {
    this.selectedTags = this.selectedTags.filter(t => t !== tag);
  }

  onSubmit() {
    // Associa i tag al prodotto
    this.product.tags = [...this.selectedTags];
    // Qui puoi aggiungere la logica per salvare il prodotto
    this.success = true;
    setTimeout(() => (this.success = false), 2000);
    this.product = new UserProduct();
    this.selectedTags = [];
  }
}
