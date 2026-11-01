import { Component, inject } from '@angular/core';
import {
    RouterLink,
    RouterLinkActive,
    RouterOutlet
} from '@angular/router';

import { AuthStore } from '../../auth/auth-store';

export interface MenuPaciente {
    label: string;
    ruta: string;
}

@Component({
    selector: 'app-paciente-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './paciente-layout.html',
    styleUrl: './paciente-layout.css'
})
export class PacienteLayout {

    menu: MenuPaciente[] = [
        { label: 'Mis turnos', ruta: '' }
    ];

    private readonly authStore = inject(AuthStore);

    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}