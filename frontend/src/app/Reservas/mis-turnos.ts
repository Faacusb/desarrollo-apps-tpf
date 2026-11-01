import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

import { AuthStore } from '../auth/auth-store';
import { AdminApiService } from '../admin/admin-api.services';
import { ReservaAdmin } from '../admin/admin.models';

@Component({
    selector: 'app-mis-turnos',
    standalone: true,
    imports: [
        CommonModule,
        DatePipe,
        TableModule,
        ButtonModule,
        DialogModule
    ],
    templateUrl: './mis-turnos.html',
    styleUrl: './mis-turnos.css'
})
export class MisTurnosComponent implements OnInit {

    turnos: ReservaAdmin[] = [];

    cargando = false;
    consultaRealizada = false;
    guardandoCancelacion = false;

    mensajeError = '';
    mensajeExito = '';

    visible = signal(false);

    turnoSeleccionado: ReservaAdmin | null = null;

    constructor(
        private readonly apiService: AdminApiService,
        private readonly authStore: AuthStore,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cargarTurnos();
    }

    // Obtener los turnos del paciente autenticado
   cargarTurnos(): void {

    const idPaciente = this.authStore.obtenerIdUsuario();

    if (idPaciente === null) {
        this.mensajeError = 'No se pudo identificar al paciente. Iniciá sesión nuevamente.';
        return;
    }

    this.cargando = true;
    this.consultaRealizada = false;
    this.mensajeError = '';

    this.apiService.listarReservasPaciente(idPaciente).subscribe({

        next: (turnos) => {

            this.turnos = turnos;
            this.cargando = false;
            this.consultaRealizada = true;

            // Actualizar la vista después de recibir las reservas
            this.cdr.detectChanges();
        },

        error: (error) => {

            console.error('Error al obtener los turnos:', error);

            this.mensajeError =
                error.error?.message ||
                'No se pudieron obtener tus turnos.';

            this.cargando = false;
            this.consultaRealizada = true;

            this.cdr.detectChanges();
        }
      });
  }   

    // Comprobar si el turno puede cancelarse
    puedeCancelar(turno: ReservaAdmin): boolean {

        if (turno.estado !== 'ACTIVO') {
            return false;
        }

        const fechaTurno = new Date(turno.fechaHora);

        if (Number.isNaN(fechaTurno.getTime())) {
            return false;
        }

        const diaAnterior = new Date(fechaTurno);

        diaAnterior.setDate(diaAnterior.getDate() - 1);
        diaAnterior.setHours(23, 59, 59, 999);

        return new Date() <= diaAnterior;
    }

    // Abrir confirmación de cancelación
    abrirConfirmacion(turno: ReservaAdmin): void {

        if (!this.puedeCancelar(turno)) {
            this.mensajeError = 'Este turno ya no se puede cancelar.';
            return;
        }

        this.mensajeError = '';
        this.turnoSeleccionado = turno;
        this.visible.set(true);
    }

    // Cerrar diálogo
    cerrarDialog(): void {

        if (this.guardandoCancelacion) {
            return;
        }

        this.visible.set(false);
        this.turnoSeleccionado = null;
    }

    // Cancelar turno en PostgreSQL
    confirmarCancelacion(): void {

        const turno = this.turnoSeleccionado;

        if (!turno || !this.puedeCancelar(turno)) {
            this.mensajeError = 'Este turno ya no se puede cancelar.';
            this.cerrarDialog();
            return;
        }

        this.guardandoCancelacion = true;
        this.mensajeError = '';
        this.mensajeExito = '';

        this.apiService.cancelarReservaPaciente(turno.id).subscribe({

            next: () => {

                this.guardandoCancelacion = false;
                this.cerrarDialog();

                this.mensajeExito = 'Turno cancelado correctamente.';

                // Volver a consultar los turnos
                this.cargarTurnos();
            },

            error: (error) => {

                console.error('Error al cancelar el turno:', error);

                this.mensajeError =
                    error.error?.message ||
                    'No se pudo cancelar el turno.';

                this.guardandoCancelacion = false;
            }
        });
    }

    // Ir al formulario de creación de reservas
    irACrearReserva(): void {
        this.router.navigate(['/reservas/nueva']);
    }
}