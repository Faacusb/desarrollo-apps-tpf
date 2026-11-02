import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

/**
 * Componente de gestión de la agenda del médico autenticado.
 *
 * Permite consultar las reservas correspondientes a una fecha
 * determinada y registrar la asistencia de los pacientes.
 *
 * Los estados de asistencia admitidos son ATENDIDO y AUSENTE.
 * Las operaciones se realizan mediante la API REST de NestJS
 * utilizando autenticación JWT.
 */
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
export class AgendaMedica implements OnInit {

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param http Servicio para realizar peticiones HTTP al backend.
     * @param cdr Servicio para actualizar la vista cuando cambian los datos.
     */
    constructor(
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef
    ) {}

    /**
     * Fecha seleccionada para filtrar la agenda médica.
     *
     * Utiliza el formato YYYY-MM-DD.
     * Si está vacía, no se envía el parámetro fecha.
     */
    fechaSeleccionada: string = '';

    /**
     * Lista de reservas obtenidas desde el backend.
     *
     * Se ordena de forma ascendente según fechaHora.
     */
    turnos: any[] = [];

    /**
     * Indica si hay una consulta de agenda en curso.
     */
    cargando: boolean = false;

    /**
     * Mensaje de error mostrado al consultar o actualizar reservas.
     */
    mensajeError: string = '';

    /**
     * Mensaje mostrado después de registrar una asistencia
     * correctamente.
     */
    mensajeExito: string = '';

    /**
     * Indica si la última consulta de agenda finalizó correctamente.
     *
     * Permite diferenciar una agenda vacía de una consulta
     * que todavía no se realizó.
     */
    consultaRealizada: boolean = false;

    /**
     * Controla la visibilidad del diálogo de confirmación
     * de asistencia.
     */
    dialogoVisible: boolean = false;

    /**
     * Reserva seleccionada para registrar su asistencia.
     *
     * Su valor es null cuando no hay una reserva seleccionada.
     */
    turnoSeleccionado: any = null;

    /**
     * Estado de asistencia que se desea registrar.
     *
     * Solo admite ATENDIDO, AUSENTE o null cuando
     * todavía no se seleccionó una acción.
     */
    estadoSeleccionado: 'ATENDIDO' | 'AUSENTE' | null = null;

    /**
     * Indica si se está enviando una actualización de asistencia.
     *
     * Evita realizar solicitudes duplicadas mientras
     * la operación está en curso.
     */
    guardandoAsistencia: boolean = false;

    /**
     * Método del ciclo de vida de Angular.
     *
     * Ejecuta la consulta inicial de la agenda cuando
     * se inicializa el componente.
     */
    ngOnInit(): void {
        this.consultarAgenda();
    }

    /**
     * Consulta la agenda del médico autenticado.
     *
     * Obtiene el token JWT desde Session Storage y realiza
     * una petición GET al endpoint /api/v1/medicos/mi-agenda.
     *
     * Si hay una fecha seleccionada, la envía como parámetro.
     * Ordena las reservas recibidas por fecha y horario.
     *
     * Gestiona los indicadores de carga, los mensajes de error
     * y la actualización de la vista.
     */
    consultarAgenda(): void {

        // Limpiar resultados y mensajes anteriores
        this.turnos = [];
        this.mensajeError = '';
        this.mensajeExito = '';
        this.consultaRealizada = false;

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
        const params: Record<string, string> = {};

        if (this.fechaSeleccionada) {
            params['fecha'] = this.fechaSeleccionada;
        }

        this.http.get<any[]>(
            '/api/v1/medicos/mi-agenda',
            {
                headers,
                params
            }
        ).subscribe({

            // Consulta exitosa
            next: (respuesta) => {

                // Guardar los turnos recibidos
                this.turnos = [...respuesta].sort(
                    (a, b) =>
                        new Date(a.fechaHora).getTime() -
                        new Date(b.fechaHora).getTime()
                );

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

    /**
     * Abre el diálogo para confirmar el registro de asistencia.
     *
     * Solamente permite seleccionar reservas en estado ACTIVO.
     * Guarda la reserva y el estado elegido antes de mostrar
     * el diálogo de confirmación.
     *
     * @param turno Reserva sobre la que se registrará la asistencia.
     * @param estado Nuevo estado: ATENDIDO o AUSENTE.
     */
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

    /**
     * Cierra el diálogo de confirmación de asistencia.
     *
     * No permite cerrarlo mientras se está guardando una
     * asistencia. Al cerrarlo, limpia la reserva y el
     * estado seleccionados.
     */
    cerrarConfirmacion(): void {

        // Evitar cerrar mientras se guarda la asistencia
        if (this.guardandoAsistencia) {
            return;
        }

        this.dialogoVisible = false;
        this.turnoSeleccionado = null;
        this.estadoSeleccionado = null;
    }

    /**
     * Registra la asistencia del paciente seleccionado.
     *
     * Verifica que exista una reserva activa, un estado
     * seleccionado y un token JWT válido en la sesión.
     *
     * Envía una petición PUT al endpoint de asistencia
     * del médico autenticado.
     *
     * Cuando la operación es exitosa, actualiza el estado
     * de la reserva en la tabla y muestra un mensaje.
     *
     * En caso de error, informa el problema correspondiente
     * sin modificar el estado de la reserva.
     */
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

    /**
     * Limpia el filtro de fecha seleccionado.
     *
     * Restablece fechaSeleccionada y vuelve a consultar
     * la agenda médica.
     */
    limpiarFiltro(): void {
        this.fechaSeleccionada = '';
        this.consultarAgenda();
    }
}
