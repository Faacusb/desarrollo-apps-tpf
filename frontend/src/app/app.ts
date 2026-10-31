import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthStore } from './auth/auth-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService]
})
export class App {
   readonly authStore = inject(AuthStore);

    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}
