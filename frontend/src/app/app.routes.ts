
import { Routes } from '@angular/router';
import { MisTurnosComponent } from './Reservas/mis-turnos';
import { AgendaMedica } from './agenda-medica/agenda-medica';

export const routes: Routes = [
    { path: 'reservas', component: MisTurnosComponent },
    { path: 'agenda-medica', component: AgendaMedica }

    // { path: '**', redirectTo: 'reservas' }
];

