import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/show/products.component';
import { LoginComponent } from './components/login/login.component';
import { ForgotComponent } from './components/forgot/forgot/forgot.component';
import { authGuard } from './shared/guards/auth.guard';
import { loginGuard } from './shared/guards/login.guard';
import { CrudProductComponent } from './components/products/crud/crud-product.component';
import { CrudUserComponent } from './components/user/crud/crud-user/crud-user.component';

export const routes: Routes = [
  { path: '', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'forgot', component: ForgotComponent },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { path: 'products/add', component: CrudProductComponent, canActivate: [authGuard] },
  { path: 'products/edit', component: CrudProductComponent, canActivate: [authGuard] },
  { path: 'register', component: CrudUserComponent },
  { path: 'user/add', component: CrudUserComponent, canActivate: [authGuard] },
  { path: 'user/edit', component: CrudUserComponent, canActivate: [authGuard] },
];

//AddProductComponent
