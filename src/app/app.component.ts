import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirebaseService as FirebaseService } from './shared/services/firebase/firebase.service';
import { AssetsService } from './shared/services/assets/assets.service';
import { FirebaseConfig } from './shared/models/firebaseConfig';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonService } from './shared/services/common/common.service';
import { lastValueFrom } from 'rxjs';
import { DefaultConfig } from './shared/models/default.config.model';
import { AppService } from './shared/services/app/app.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'shared-login';
  username = '';
  password = '';
  error = '';
  showPassword = false;

  constructor(
    private common_service: CommonService,
    private app_service: AppService
  ) { }

  async ngOnInit() {
    await this.app_service.initApp();
  }
}
