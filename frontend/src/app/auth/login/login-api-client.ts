import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

/**
 * Servicio encargado de comunicarse con la API de autenticación.
 *
 * Realiza peticiones HTTP al backend NestJS para validar
 * las credenciales de los usuarios.
 *
 * Cuando la autenticación es exitosa, recibe un token JWT
 * que posteriormente es almacenado por AuthStore.
 *
 * Este servicio está disponible globalmente mediante
 * providedIn: "root".
 */
@Injectable({
    providedIn: "root"
})
export class LoginApiClient {

    /**
     * Cliente HTTP de Angular utilizado para realizar
     * peticiones al backend.
     */
    private readonly httpClient: HttpClient = inject(HttpClient);

    /**
     * Solicita el inicio de sesión de un usuario.
     *
     * Envía las credenciales mediante una petición POST
     * al endpoint /api/v1/auth/login.
     *
     * @param email Correo electrónico del usuario.
     * @param clave Contraseña del usuario.
     * @returns Observable que emite un objeto con el token
     * JWT accessToken cuando la autenticación es exitosa.
     */
    iniciarSesion(
        email: string,
        clave: string
    ): Observable<{ accessToken: string }> {

        return this.httpClient.post<{ accessToken: string }>(
            "/api/v1/auth/login",
            { email, clave }
        );
    }
}
