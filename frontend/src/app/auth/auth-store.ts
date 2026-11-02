import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

/**
 * Servicio encargado de administrar la sesión del usuario autenticado.
 *
 * Almacena y recupera el token JWT mediante Session Storage.
 * Permite consultar el rol y el identificador del usuario
 * a partir de la información contenida en el token.
 *
 * También verifica la fecha de expiración del JWT al obtener
 * el rol y permite cerrar la sesión del usuario.
 *
 * Está disponible globalmente mediante providedIn: "root".
 */
@Injectable({
    providedIn: "root"
})
export class AuthStore {

    /**
     * Servicio de navegación de Angular.
     *
     * Se utiliza para redirigir al usuario a la pantalla
     * de inicio de sesión cuando cierra su sesión.
     */
    private readonly router: Router = inject(Router);

    /**
     * Guarda el token JWT recibido desde el backend.
     *
     * Utiliza Session Storage para conservar el token
     * durante la sesión actual del navegador.
     *
     * @param token Token JWT generado después de una
     * autenticación exitosa.
     */
    guardarToken(token: string): void {
        sessionStorage.setItem("accessToken", token);
    }

    /**
     * Recupera el token JWT almacenado en la sesión.
     *
     * @returns Token JWT almacenado o null si no existe.
     */
    obtenerToken(): string | null {
        return sessionStorage.getItem("accessToken");
    }

    /**
     * Obtiene el rol del usuario autenticado a partir del JWT.
     *
     * Recupera el token, decodifica su payload y consulta
     * la propiedad rol.
     *
     * Comprueba que el token tenga una fecha de expiración
     * válida y que no haya vencido.
     *
     * Si el token está vencido, lo elimina de Session Storage.
     *
     * @returns Rol del usuario autenticado, como ADMINISTRADOR,
     * MEDICO o PACIENTE. Devuelve null si el token no existe,
     * está vencido, es inválido o no contiene un rol válido.
     */
    obtenerRol(): string | null {

        const token = this.obtenerToken();

        if (!token) {
            return null;
        }

        try {

            const parte = token.split('.')[1];

            if (!parte) {
                return null;
            }

            let base64 = parte
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            base64 += '='.repeat((4 - base64.length % 4) % 4);

            const payload = JSON.parse(atob(base64));

            // Comprobar vencimiento del token
            if (
                typeof payload.exp !== 'number' ||
                payload.exp * 1000 <= Date.now()
            ) {
                sessionStorage.removeItem('accessToken');
                return null;
            }

            return typeof payload.rol === 'string'
                ? payload.rol
                : null;

        } catch {
            return null;
        }
    }

    /**
     * Obtiene el identificador del usuario autenticado.
     *
     * Decodifica el payload del token JWT y extrae la
     * propiedad sub, que representa el ID del usuario.
     *
     * Verifica que el identificador sea un número entero
     * seguro y mayor que cero.
     *
     * @returns Identificador numérico del usuario o null
     * si no existe un token válido o no puede obtenerse
     * un identificador correcto.
     */
    obtenerIdUsuario(): number | null {

        const token = this.obtenerToken();

        if (!token) {
            return null;
        }

        try {

            const parte = token.split('.')[1];

            if (!parte) {
                return null;
            }

            let base64 = parte
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            base64 += '='.repeat((4 - base64.length % 4) % 4);

            const payload = JSON.parse(atob(base64));

            const id = Number(payload.sub);

            return Number.isSafeInteger(id) && id > 0
                ? id
                : null;

        } catch {
            return null;
        }
    }

    /**
     * Cierra la sesión del usuario autenticado.
     *
     * Elimina el token JWT de Session Storage y
     * redirige al usuario a la pantalla de login.
     */
    cerrarSesion(): void {

        sessionStorage.removeItem("accessToken");

        this.router.navigateByUrl("/login");
    }
}
