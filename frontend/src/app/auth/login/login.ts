import { Component, inject } from "@angular/core";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { MessageService } from "primeng/api";
import { LoginApiClient } from "./login-api-client";
import { AuthStore } from "../auth-store";
import { Router } from "@angular/router";
import { Button } from "primeng/button";
import { Password } from "primeng/password";
import { InputText } from "primeng/inputtext";

/**
 * Componente de inicio de sesión del sistema de reservas médicas.
 *
 * Permite que los usuarios ingresen mediante correo electrónico
 * y contraseña.
 *
 * Valida el formulario, envía las credenciales al backend NestJS
 * y almacena el token JWT recibido mediante AuthStore.
 *
 * Después de autenticar al usuario, lo redirige según su rol:
 * - ADMINISTRADOR: panel de administración.
 * - MEDICO: agenda médica.
 * - PACIENTE: sección de reservas.
 *
 * Utiliza PrimeNG para mostrar los mensajes de error.
 */
@Component({
    selector: "app-login",
    standalone: true,
    templateUrl: "./login.html",
    styleUrl: "./login.css",
    imports: [
        ReactiveFormsModule,
        InputText,
        Password,
        Button
    ]
})
export class Login {

    /**
     * Servicio de PrimeNG utilizado para mostrar
     * notificaciones y mensajes al usuario.
     */
    private readonly messageService = inject(MessageService);

    /**
     * Servicio encargado de enviar las credenciales
     * al endpoint de autenticación del backend.
     */
    private readonly loginApiClient = inject(LoginApiClient);

    /**
     * Servicio que administra el estado de autenticación,
     * el almacenamiento del token JWT y el rol del usuario.
     */
    private readonly authStore = inject(AuthStore);

    /**
     * Servicio de navegación de Angular utilizado para
     * redirigir al usuario después del inicio de sesión.
     */
    private readonly router = inject(Router);

    /**
     * Formulario reactivo de autenticación.
     *
     * Contiene el correo electrónico y la contraseña.
     * Ambos campos son obligatorios y el correo debe
     * cumplir con un formato válido.
     */
    form = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),
        clave: new FormControl('', [
            Validators.required
        ])
    });

    /**
     * Procesa el inicio de sesión del usuario.
     *
     * Primero verifica que los campos del formulario
     * cumplan con las validaciones establecidas.
     *
     * Si los datos son válidos, solicita la autenticación
     * al backend mediante LoginApiClient.
     *
     * Cuando la autenticación es exitosa:
     * - Guarda el token JWT mediante AuthStore.
     * - Obtiene el rol del usuario autenticado.
     * - Redirige a la pantalla correspondiente.
     *
     * Si el rol no puede identificarse, cierra la sesión
     * y muestra un mensaje de error.
     *
     * Si la petición falla, informa al usuario mediante
     * el servicio de mensajes de PrimeNG.
     *
     * @returns No devuelve un valor.
     */
    iniciarSesion(): void {

        if (this.form.invalid) {

            this.form.markAllAsTouched();

            this.messageService.add({
                severity: "error",
                summary: "Completá correctamente el correo electrónico y la contraseña."
            });

            return;
        }

        const email = this.form.value.email!;
        const clave = this.form.value.clave!;

        this.loginApiClient.iniciarSesion(email, clave).subscribe({

            next: (res) => {

                this.authStore.guardarToken(res.accessToken);

                const rol = this.authStore.obtenerRol();

                const rutas: Record<string, string> = {
                    ADMINISTRADOR: '/admin',
                    MEDICO: '/agenda-medica',
                    PACIENTE: '/reservas'
                };

                const destino = rol ? rutas[rol] : null;

                if (!destino) {

                    this.authStore.cerrarSesion();

                    this.messageService.add({
                        severity: "error",
                        summary: "No se pudo identificar el rol del usuario."
                    });

                    return;
                }

                void this.router.navigateByUrl(destino);
            },

            error: (err) => {

                console.error("Error al iniciar sesión:", err);

                this.messageService.add({
                    severity: "error",
                    summary: "No se pudo iniciar sesión.",
                    detail: "Verificá tu correo electrónico y contraseña."
                });
            }
        });
    }
}
