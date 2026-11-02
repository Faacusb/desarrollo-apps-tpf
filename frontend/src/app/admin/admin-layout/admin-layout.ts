import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthStore } from "../../auth/auth-store";

/**
 * Representa una opción del menú de navegación administrativo.
 *
 * Cada opción contiene un texto visible para el usuario
 * y una ruta de navegación dentro del área administrativa.
 */
export interface Menu {

    /**
     * Texto que identifica la opción de navegación.
     */
    label: string;

    /**
     * Ruta relativa correspondiente a la opción del menú.
     */
    ruta: string;
}

/**
 * Componente de estructura y navegación del área administrativa.
 *
 * Proporciona el menú principal del administrador y un
 * RouterOutlet para visualizar las diferentes pantallas.
 *
 * Permite navegar entre:
 * - Monitor de reservas.
 * - Gestión de médicos.
 * - Creación de nuevas reservas.
 *
 * También dispone de una operación para cerrar sesión,
 * utilizando el servicio AuthStore.
 */
@Component({
    selector: "app-admin-layout",
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
    ],
    templateUrl: "./admin-layout.html",
    styleUrl: "./admin-layout.css"
})
export class AdminLayout {

    /**
     * Opciones disponibles en el menú administrativo.
     *
     * Cada elemento define la etiqueta visible
     * y su correspondiente ruta de navegación.
     */
    menu: Menu[] = [
        { label: "Monitor de reservas", ruta: "reservas" },
        { label: "Médicos", ruta: "medicos" },
        { label: "Nueva reserva", ruta: "reservas/nueva" },
    ];

    /**
     * Servicio encargado de gestionar la sesión
     * del usuario autenticado.
     */
    private readonly authStore: AuthStore = inject(AuthStore);

    /**
     * Cierra la sesión del administrador.
     *
     * Elimina el token JWT mediante AuthStore
     * y redirige al usuario a la pantalla de login.
     *
     * @returns No devuelve ningún valor.
     */
    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}
