import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  username: string | null = null;
  currentTime: string = '';
  private timeInterval: any;
  private isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // ✅ Vérifier si on est dans le navigateur avant d'utiliser localStorage
    if (this.isBrowser) {
      this.username = localStorage.getItem('username');
    }
  }

  ngOnInit() {
    this.updateTime();
    
    // ✅ Créer l'interval seulement côté client
    if (this.isBrowser) {
      this.timeInterval = setInterval(() => {
        this.updateTime();
      }, 1000);
    }
  }

  ngOnDestroy() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  private updateTime() {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    this.currentTime = now.toLocaleDateString('fr-FR', options);
  }
}