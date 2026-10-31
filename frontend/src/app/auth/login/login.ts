import { Component, inject } from "@angular/core";
import {FormControl,FormGroup,ReactiveFormsModule,Validators} from "@angular/forms";
import { MessageService } from "primeng/api";
import { LoginApiClient } from "./login-api-client";
import { AuthStore } from "../auth-store";
import { Router } from "@angular/router";
import { Button } from "primeng/button";
import { Password } from "primeng/password";
import { InputText } from "primeng/inputtext";

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

    private readonly messageService = inject(MessageService);

    private readonly loginApiClient = inject(LoginApiClient);

    private readonly authStore = inject(AuthStore);

    private readonly router = inject(Router);

    form = new FormGroup({
        email: new FormControl('', [
            Validators.required,
            Validators.email
        ]),
        clave: new FormControl('', [
            Validators.required
        ])
    });

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