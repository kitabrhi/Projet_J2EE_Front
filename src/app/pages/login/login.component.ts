import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin() {
    this.errorMessage = null;

    this.authService.login(this.username, this.password)
      .subscribe({
        next: (res) => {
          // on garde le token + username
          localStorage.setItem('token', res.token);
          localStorage.setItem('username', res.username);

          console.log('Login OK, token =', res.token);

          // ➜ redirection vers le dashboard
          this.router.navigate(['/dashboard']);
        },
        error: () => {
          this.errorMessage = 'Identifiants invalides';
        }
      });
  }
}
