
import { Routes } from '@angular/router';
import { MisTurnosComponent } from './Reservas/mis-turnos';
import { AgendaMedica } from './agenda-medica/agenda-medica';
import { AdminLayout } from './admin/admin-layout/admin-layout';
import { MonitorReservas } from './admin/reservas-monitor/reservas-monitor';
import { MedicosLista } from './admin/medicos-lista/medicos-lista';
import { ReservaForm } from './admin/reservas-form/reservas-form';
import { Login } from './auth/login/login';
import {authGuard,roleGuard} from './auth/guards/auth.guards';
import { PacienteLayout } from './Reservas/paciente-layout/paciente-layout';
import { CrearReservaPacienteComponent } from './Reservas/crear-reserva/crear-reserva';
import { MedicoLayout } from './agenda-medica/medico-layout/medico-layout';

export const routes: Routes = [
    { path: "login", component: Login },

    {
        path: 'reservas',
        component: PacienteLayout,

        canActivate: [
            authGuard,
            roleGuard(['PACIENTE'])
        ],

        canActivateChild: [
            authGuard,
            roleGuard(['PACIENTE'])
        ],

        children: [
            {
                path: '',
                component: MisTurnosComponent,
                pathMatch: 'full'
            },
            {
                path: 'nueva',
                component: CrearReservaPacienteComponent
            }
        ]
    },

    {
        path: 'agenda-medica',
        component: MedicoLayout,
        canActivate: [authGuard, roleGuard(['MEDICO'])],
        canActivateChild: [authGuard, roleGuard(['MEDICO'])],
        children: [
            {
                path: '',
                component: AgendaMedica,
                pathMatch: 'full'
            }
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

