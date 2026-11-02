import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../auth/auth-store';

/**
 * Componente principal del área de médicos.
 *
 * Define la estructura visual y de navegación del portal médico.
 *
 * Proporciona un contenedor para las pantallas correspondientes
 * al usuario con rol MEDICO, incluyendo la Agenda Médica.
 *
 * Utiliza RouterOutlet para mostrar los componentes asociados
 * a las rutas hijas y RouterLink para la navegación.
 *
 * Accede al servicio AuthStore para consultar la información
 * de autenticación del usuario y permitir las operaciones
 * de sesión disponibles desde la interfaz.
 */
@Component({
    selector: 'app-medico-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './medico-layout.html',
    styleUrl: './medico-layout.css',
})
export class MedicoLayout {

    /**
     * Inicializa el componente con el servicio de autenticación.
     *
     * @param authStore Servicio que administra el estado
     * de autenticación del usuario.
     */
    constructor(
        /**
         * Servicio de autenticación disponible para la plantilla
         * del portal médico.
         *
         * Permite acceder al estado de la sesión y a las
         * operaciones públicas proporcionadas por AuthStore.
         */
        public authStore: AuthStore
    ) {}

}
