
import { Routes } from '@angular/router';
import { MisTurnosComponent } from './Reservas/mis-turnos';
import { AgendaMedica } from './agenda-medica/agenda-medica';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { MonitorReservas } from './admin/reservas-monitor/reservas-monitor';
import { MedicosLista } from './admin/medicos-lista/medicos-lista';
import { ReservaForm } from './admin/reservas-form/reservas-form';
import { Login } from './auth/login/login';

export const routes: Routes = [
    { path: "login", component: Login },
    { path: 'reservas', component: MisTurnosComponent },
    { path: 'agenda-medica', component: AgendaMedica },
    { path: 'admin', component: AdminLayout },
    { path: 'admin/reservas', component: MonitorReservas },
    { path: 'admin/medicos', component: MedicosLista },
    { path: 'admin/reservas/nueva', component: ReservaForm }
    // { path: '**', redirectTo: 'reservas' }
];

