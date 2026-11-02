
import { inject } from '@angular/core';
import {
    CanActivateFn,
    Router
} from '@angular/router';

import { AuthStore } from '../auth-store';

/**
 * Guard de autenticación para proteger las rutas de Angular.
 *
 * Verifica que el usuario tenga un token JWT almacenado
 * y que AuthStore pueda obtener un rol válido de la sesión.
 *
 * Si el usuario está autenticado, permite acceder a la ruta.
 *
 * En caso contrario, redirige a la pantalla de inicio de sesión
 * y conserva la URL solicitada mediante el parámetro returnUrl.
 *
 * @param route Información de la ruta que se intenta activar.
 * @param state Estado de navegación que contiene la URL solicitada.
 * @returns true si existe una sesión válida o un UrlTree
 * que redirige al usuario al login.
 */
export const authGuard: CanActivateFn = (route, state) => {

    const authStore = inject(AuthStore);
    const router = inject(Router);

    const token = authStore.obtenerToken();
    const rol = authStore.obtenerRol();

    if (token && rol) {
        return true;
    }

    return router.createUrlTree(['/login'], {
        queryParams: {
            returnUrl: state.url
        }
    });
};

/**
 * Crea un guard de autorización basado en roles.
 *
 * Permite restringir el acceso a una ruta según los roles
 * autorizados para utilizar una funcionalidad del sistema.
 *
 * Los roles definidos son:
 * - ADMINISTRADOR: gestión administrativa.
 * - MEDICO: consulta de agenda y registro de asistencia.
 * - PACIENTE: gestión de sus reservas.
 *
 * Si el usuario no tiene una sesión válida, lo redirige
 * a la pantalla de login.
 *
 * Si está autenticado pero su rol no está permitido,
 * lo redirige a la pantalla correspondiente a su rol.
 *
 * @param rolesPermitidos Lista de roles autorizados
 * para acceder a la ruta protegida.
 * @returns Función CanActivateFn que evalúa el rol
 * del usuario y permite el acceso o devuelve un UrlTree.
 */
export function roleGuard(rolesPermitidos: string[]): CanActivateFn {

    return () => {

        const authStore = inject(AuthStore);
        const router = inject(Router);

        const rol = authStore.obtenerRol();

        if (!rol) {
            return router.createUrlTree(['/login']);
        }

        if (rolesPermitidos.includes(rol)) {
            return true;
        }

        // Si no tiene permiso, redirigir a su pantalla correspondiente
        const rutas: Record<string, string> = {
            ADMINISTRADOR: '/admin',
            MEDICO: '/agenda-medica',
            PACIENTE: '/reservas'
        };

        return router.createUrlTree([
            rutas[rol] ?? '/login'
        ]);
    };
}
