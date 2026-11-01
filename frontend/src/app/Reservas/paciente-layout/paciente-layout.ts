import { Component, inject } from '@angular/core';
import {
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
        RouterLinkActive
    ],
    templateUrl: './paciente-layout.html',
    styleUrl: './paciente-layout.css'
})
export class PacienteLayout {

    menu: MenuPaciente[] = [
        { label: 'Mis turnos', ruta: '' },
        { label: 'Solicitar turno', ruta: 'nueva' }
    ];

    private readonly authStore = inject(AuthStore);

    cerrarSesion(): void {
        this.authStore.cerrarSesion();
    }
}