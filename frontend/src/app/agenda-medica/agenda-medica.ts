import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-agenda-medica',
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        DialogModule
    ],
    templateUrl: './agenda-medica.html',
    styleUrl: './agenda-medica.css',
})
export class AgendaMedica {

    // Inyectar servicios
    constructor(
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef
    ) {}

    // Fecha seleccionada para consultar la agenda
    fechaSeleccionada: string = '';

    // Lista de turnos del médico
    turnos: any[] = [];

    // Estado de la pantalla
    cargando: boolean = false;
    mensajeError: string = '';

    // Mensaje cuando se registra correctamente una asistencia
    mensajeExito: string = '';

    // Indica si ya se realizó una consulta exitosa
    consultaRealizada: boolean = false;

    // Control de la ventana de confirmación
    dialogoVisible: boolean = false;

    // Reserva sobre la que se realizará la acción
    turnoSeleccionado: any = null;

    // Estado que se desea registrar
    estadoSeleccionado: 'ATENDIDO' | 'AUSENTE' | null = null;

    // Indica si se está guardando una asistencia
    guardandoAsistencia: boolean = false;


    // Consultar agenda del médico autenticado
    consultarAgenda(): void {

        // Limpiar resultados y mensajes anteriores
        this.turnos = [];
        this.mensajeError = '';
        this.mensajeExito = '';
        this.consultaRealizada = false;

        // Validar la fecha
        if (!this.fechaSeleccionada) {
            this.mensajeError = 'Seleccioná una fecha.';
            return;
        }

        // Obtener el token JWT
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            this.mensajeError = 'Debés iniciar sesión como médico.';
            return;
        }

        // Preparar encabezado de autenticación
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        // Activar indicador de carga
        this.cargando = true;

        // Consultar el backend NestJS
        this.http.get<any[]>(
            '/api/v1/medicos/mi-agenda',
            {
                headers,
                params: {
                    fecha: this.fechaSeleccionada
                }
            }
        ).subscribe({

            // Consulta exitosa
            next: (respuesta) => {

                // Guardar los turnos recibidos
                this.turnos = respuesta;

                // Finalizar carga
                this.cargando = false;

                // Indicar que la consulta se realizó correctamente
                this.consultaRealizada = true;

                // Actualizar la vista de Angular
                this.cdr.markForCheck();
            },

            // Error al consultar la agenda
            error: (error) => {

                this.cargando = false;
                this.consultaRealizada = false;

                if (error.status === 401) {
                    this.mensajeError =
                        'Tu sesión no es válida o ha expirado.';
                } else if (error.status === 403) {
                    this.mensajeError =
                        'No tenés permiso para consultar esta agenda.';
                } else if (error.status === 400) {
                    this.mensajeError =
                        'La fecha ingresada no es válida.';
                } else {
                    this.mensajeError =
                        'No se pudo consultar la agenda médica.';
                }

                console.error('Error al consultar agenda:', error);

                // Actualizar la vista en caso de error
                this.cdr.markForCheck();
            }
        });
    }


    // Abrir ventana para confirmar la asistencia
    abrirConfirmacion(
        turno: any,
        estado: 'ATENDIDO' | 'AUSENTE'
    ): void {

        // Solo permitir acciones sobre reservas activas
        if (turno.estado !== 'ACTIVO') {
            return;
        }

        // Guardar reserva y estado seleccionados
        this.turnoSeleccionado = turno;
        this.estadoSeleccionado = estado;

        // Limpiar mensajes anteriores
        this.mensajeError = '';
        this.mensajeExito = '';

        // Mostrar ventana de confirmación
        this.dialogoVisible = true;
    }


    // Cerrar ventana de confirmación
    cerrarConfirmacion(): void {

        // Evitar cerrar mientras se guarda la asistencia
        if (this.guardandoAsistencia) {
            return;
        }

        this.dialogoVisible = false;
        this.turnoSeleccionado = null;
        this.estadoSeleccionado = null;
    }


    // Confirmar y guardar la asistencia del paciente
    confirmarAsistencia(): void {

        // Verificar que haya una reserva y un estado seleccionados
        if (
            !this.turnoSeleccionado ||
            !this.estadoSeleccionado ||
            this.guardandoAsistencia
        ) {
            return;
        }

        // Verificar que la reserva esté activa
        if (this.turnoSeleccionado.estado !== 'ACTIVO') {
            return;
        }

        // Obtener el token JWT
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            this.mensajeError = 'Debés iniciar sesión como médico.';
            this.cerrarConfirmacion();
            return;
        }

        // Guardar los datos antes de enviar la petición
        const idReserva = this.turnoSeleccionado.id;
        const estado = this.estadoSeleccionado;

        // Preparar encabezado de autenticación
        const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
        });

        // Activar indicador de guardado
        this.guardandoAsistencia = true;

        // Limpiar mensajes anteriores
        this.mensajeError = '';
        this.mensajeExito = '';

        // Actualizar la reserva en NestJS
        this.http.put<void>(
            `/api/v1/medicos/mi-agenda/${idReserva}/asistencia`,
            { estado },
            { headers }
        ).subscribe({

            // Asistencia registrada correctamente
            next: () => {

                // Actualizar el estado en la tabla
                this.turnos = this.turnos.map(turno =>
                    turno.id === idReserva
                        ? { ...turno, estado }
                        : turno
                );

                // Finalizar guardado
                this.guardandoAsistencia = false;

                // Mostrar mensaje de éxito
                this.mensajeExito =
                    `La reserva se registró correctamente como ${estado}.`;

                // Cerrar la ventana de confirmación
                this.cerrarConfirmacion();

                // Actualizar la pantalla
                this.cdr.markForCheck();
            },

            // Error al registrar asistencia
            error: (error) => {

                this.guardandoAsistencia = false;

                if (error.status === 401) {
                    this.mensajeError =
                        'Tu sesión no es válida o ha expirado.';
                } else if (error.status === 403) {
                    this.mensajeError =
                        'No tenés permiso para registrar asistencia.';
                } else if (error.status === 400) {
                    this.mensajeError =
                        'La reserva ya no está activa o el estado no es válido.';
                } else if (error.status === 404) {
                    this.mensajeError =
                        'La reserva no existe o no pertenece a este médico.';
                } else {
                    this.mensajeError =
                        'No se pudo registrar la asistencia.';
                }

                console.error('Error al registrar asistencia:', error);

                // Actualizar la vista en caso de error
                this.cdr.markForCheck();
            }
        });
    }
}
