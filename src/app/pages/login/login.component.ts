import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';
  errorMessage: string | null = null;
  private isBrowser: boolean;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  onLogin() {
    this.errorMessage = null;

    this.authService.login(this.username, this.password).subscribe({
      next: (res) => {
        if (this.isBrowser) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);
        }
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.errorMessage = 'Identifiants invalides';
      }
    });
  }
}
