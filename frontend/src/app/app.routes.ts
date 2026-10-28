import { Routes } from '@angular/router';
import { MisTurnosComponent } from './Reservas/mis-turnos';

export const routes: Routes = [
    { path: "reservas", component: MisTurnosComponent},
    //{ path: "**", redirectTo: "reservas"}
];
