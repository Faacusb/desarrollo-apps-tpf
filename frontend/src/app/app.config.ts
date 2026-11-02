import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth/auth-interceptor';

/**
 * Configuración global de la aplicación Angular.
 *
 * Define los proveedores utilizados durante el inicio
 * de la aplicación mediante bootstrapApplication.
 *
 * Incluye las siguientes configuraciones:
 *
 * - provideBrowserGlobalErrorListeners:
 *   habilita los manejadores globales de errores del navegador.
 *
 * - provideRouter:
 *   registra las rutas definidas en app.routes.ts.
 *
 * - providePrimeNG:
 *   configura PrimeNG utilizando el tema Aura.
 *
 * - provideHttpClient:
 *   habilita HttpClient para la comunicación con el backend.
 *
 * - withInterceptors:
 *   registra authInterceptor para incorporar el token JWT
 *   a las peticiones HTTP cuando está disponible.
 *
 * Esta configuración corresponde a la arquitectura
 * standalone utilizada por el frontend del sistema.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
