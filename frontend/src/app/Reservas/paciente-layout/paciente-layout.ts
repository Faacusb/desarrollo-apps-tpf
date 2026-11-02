import { Component, inject } from '@angular/core';
import {
    RouterLinkActive,
    RouterOutlet
} from '@angular/router';

import { AuthStore } from '../../auth/auth-store';

/**
 * Representa una opción del menú de navegación del paciente.
 *
 * Define el texto que se muestra en el menú y la ruta
 * relativa a la que permite navegar dentro del portal.
 */
export interface MenuPaciente {

    /**
     * Texto visible de la opción del menú.
     */
    label: string;

    /**
     * Ruta relativa asociada a la opción.
     */
    ruta: string;
}

/**
 * Componente de estructura y navegación del portal de pacientes.
 *
 * Proporciona el menú principal para acceder a las
 * funcionalidades disponibles para el rol PACIENTE.
 *
 * Permite navegar entre:
 * - Mis turnos: consulta de reservas del paciente.
 * - Solicitar turno: creación de nuevas reservas.
 *
 * Utiliza RouterOutlet para mostrar las pantallas
 * correspondientes a las rutas hijas.
 *
 * También permite cerrar la sesión mediante AuthStore.
 */
@Component({
    selector: 'app-paciente-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLinkActive
    ],
    templateUrl: './paciente-layout.html',
    styleUrl: './paciente-layout.css'
})
export class PacienteLayout {

    /**
     * Opciones disponibles en el menú del paciente.
     *
     * Cada elemento contiene una etiqueta visible
     * y una ruta relativa dentro de /reservas.
     */
    menu: MenuPaciente[] = [
        { label: 'Mis turnos', ruta: '' },
        { label: 'Solicitar turno', ruta: 'nueva' }
    ];

    /**
     * Servicio de autenticación utilizado para
     * administrar la sesión del paciente.
     */
    private readonly authStore = inject(AuthStore);

    /**
     * Cierra la sesión del paciente autenticado.
     *
     * Delega el cierre de sesión en AuthStore,
     * que elimina el token JWT almacenado
     * y redirige al usuario al login.
     */
    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}
