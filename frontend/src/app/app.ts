import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthStore } from './auth/auth-store';

/**
 * Componente raíz de la aplicación Angular.
 *
 * Define el contenedor principal de la interfaz del
 * sistema de reservas médicas.
 *
 * Utiliza RouterOutlet para mostrar las pantallas
 * correspondientes a las rutas de la aplicación.
 *
 * Incorpora ToastModule y MessageService de PrimeNG
 * para mostrar notificaciones al usuario.
 *
 * También permite acceder al servicio de autenticación
 * para gestionar el cierre de sesión.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.css',
  providers: [MessageService]
})
export class App {

    /**
     * Servicio encargado de administrar la sesión
     * del usuario autenticado.
     *
     * Permite consultar el estado de autenticación
     * y ejecutar el cierre de sesión.
     */
    readonly authStore = inject(AuthStore);

    /**
     * Cierra la sesión del usuario actual.
     *
     * Delega la operación en AuthStore, que elimina
     * el token JWT almacenado y redirige al login.
     *
     * @returns No devuelve ningún valor.
     */
    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}
