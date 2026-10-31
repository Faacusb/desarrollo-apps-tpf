import { inject } from '@angular/core';
import {
    CanActivateFn,
    Router
} from '@angular/router';

import { AuthStore } from '../auth-store';

// Verificar que el usuario tenga una sesión válida
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

// Verificar que el usuario tenga el rol permitido
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