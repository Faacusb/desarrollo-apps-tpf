
import { Routes } from '@angular/router';
import { MisTurnosComponent } from './Reservas/mis-turnos';
import { AgendaMedica } from './agenda-medica/agenda-medica';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { MonitorReservas } from './admin/reservas-monitor/reservas-monitor';
import { MedicosLista } from './admin/medicos-lista/medicos-lista';
import { ReservaForm } from './admin/reservas-form/reservas-form';
import { Login } from './auth/login/login';
import {authGuard,roleGuard} from './auth/guards/auth.guards';

export const routes: Routes = [
    { path: "login", component: Login },
    { 
        path: 'reservas', 
        component: MisTurnosComponent,
        canActivate: [
            authGuard, 
            roleGuard(['PACIENTE'])
        ]
    },

    { 
        path: 'agenda-medica', 
        component: AgendaMedica,
        canActivate: [
            authGuard,
            roleGuard(['MEDICO'])
        ]
    },

    { 
        path: 'admin',
        component: AdminLayout,
        children: [
            { path: '', redirectTo: 'reservas', pathMatch: 'full' },
            { path: 'reservas', component: MonitorReservas, pathMatch: 'full' },
            { path: 'medicos', component: MedicosLista },
            { path: 'reservas/nueva', component: ReservaForm },
        ],
    },
    // { path: '**', redirectTo: 'reservas' }
];

