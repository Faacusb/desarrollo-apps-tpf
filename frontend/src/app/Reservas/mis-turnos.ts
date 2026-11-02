import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { Router } from '@angular/router';

import { AuthStore } from '../auth/auth-store';
import { AdminApiService } from '../admin/admin-api.services';
import { ReservaAdmin } from '../admin/admin.models';

/**
 * Componente de consulta y gestión de los turnos del paciente.
 *
 * Permite al usuario autenticado consultar sus reservas médicas,
 * visualizar el estado de cada turno y cancelar aquellas reservas
 * que cumplan las condiciones establecidas por el sistema.
 *
 * Obtiene el identificador del paciente desde AuthStore
 * y utiliza AdminApiService para comunicarse con el backend NestJS.
 *
 * Incluye una tabla de PrimeNG para mostrar los turnos y un
 * diálogo de confirmación para las cancelaciones.
 *
 * También gestiona los indicadores de carga, los mensajes
 * de error, las confirmaciones y la navegación hacia
 * el formulario de nuevas reservas.
 */
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

    /**
     * Lista de reservas correspondientes al paciente autenticado.
     *
     * Se obtiene desde el backend y contiene los datos
     * necesarios para visualizar los turnos y sus estados.
     */
    turnos: ReservaAdmin[] = [];

    /**
     * Indica si se está consultando el listado de turnos.
     *
     * Permite mostrar un indicador de carga mientras
     * se espera la respuesta del backend.
     */
    cargando = false;

    /**
     * Indica si finalizó una consulta de turnos.
     *
     * Permite diferenciar el estado inicial de la pantalla
     * de una consulta que ya obtuvo una respuesta.
     */
    consultaRealizada = false;

    /**
     * Indica si se está procesando una cancelación.
     *
     * Evita cerrar el diálogo de confirmación mientras
     * se está enviando la solicitud al backend.
     */
    guardandoCancelacion = false;

    /**
     * Mensaje de error mostrado cuando falla la consulta
     * o la cancelación de una reserva.
     */
    mensajeError = '';

    /**
     * Mensaje de confirmación mostrado después
     * de cancelar correctamente un turno.
     */
    mensajeExito = '';

    /**
     * Señal de Angular que controla la visibilidad
     * del diálogo de confirmación de cancelación.
     */
    visible = signal(false);

    /**
     * Reserva seleccionada para realizar una cancelación.
     *
     * Es null cuando no existe una reserva seleccionada.
     */
    turnoSeleccionado: ReservaAdmin | null = null;

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param apiService Servicio encargado de realizar las
     * operaciones HTTP relacionadas con las reservas.
     * @param authStore Servicio que administra la autenticación
     * y permite obtener el identificador del paciente.
     * @param router Servicio de navegación de Angular.
     * @param cdr Servicio utilizado para actualizar la vista
     * después de las respuestas del backend.
     */
    constructor(
        private readonly apiService: AdminApiService,
        private readonly authStore: AuthStore,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {}

    /**
     * Método del ciclo de vida de Angular.
     *
     * Ejecuta la consulta inicial de los turnos
     * correspondientes al paciente autenticado.
     */
    ngOnInit(): void {
        this.cargarTurnos();
    }

    /**
     * Obtiene las reservas del paciente autenticado.
     *
     * Recupera el identificador del usuario desde AuthStore.
     * Si no puede identificarlo, muestra un mensaje
     * solicitando que vuelva a iniciar sesión.
     *
     * Si existe un identificador, consulta el backend
     * mediante AdminApiService.listarReservasPaciente().
     *
     * Actualiza el listado de turnos, los indicadores
     * de carga y el estado de la consulta.
     *
     * Gestiona los errores HTTP y utiliza ChangeDetectorRef
     * para actualizar la interfaz después de la respuesta.
     */
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

    /**
     * Determina si un turno puede ser cancelado por el paciente.
     *
     * Comprueba que la reserva se encuentre en estado ACTIVO
     * y que su fecha y hora sean válidas.
     *
     * Calcula el final del día anterior al turno y permite
     * la cancelación únicamente hasta ese momento.
     *
     * @param turno Reserva que se desea evaluar.
     * @returns true si la reserva está activa y todavía
     * se encuentra dentro del plazo de cancelación;
     * false en caso contrario.
     */
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

    /**
     * Abre el diálogo para confirmar la cancelación de un turno.
     *
     * Primero verifica que la reserva pueda cancelarse
     * utilizando el método puedeCancelar().
     *
     * Si la reserva no cumple las condiciones, muestra
     * un mensaje de error y no abre el diálogo.
     *
     * Si puede cancelarse, guarda el turno seleccionado,
     * limpia los errores y muestra la confirmación.
     *
     * @param turno Reserva que el paciente desea cancelar.
     */
    abrirConfirmacion(turno: ReservaAdmin): void {

        if (!this.puedeCancelar(turno)) {
            this.mensajeError = 'Este turno ya no se puede cancelar.';
            return;
        }

        this.mensajeError = '';
        this.turnoSeleccionado = turno;
        this.visible.set(true);
    }

    /**
     * Cierra el diálogo de confirmación de cancelación.
     *
     * Impide cerrar la ventana si existe una cancelación
     * en curso.
     *
     * Cuando se permite el cierre, oculta el diálogo
     * y limpia la reserva seleccionada.
     */
    cerrarDialog(): void {

        if (this.guardandoCancelacion) {
            return;
        }

        this.visible.set(false);
        this.turnoSeleccionado = null;
    }

    /**
     * Confirma y procesa la cancelación de una reserva.
     *
     * Verifica que exista un turno seleccionado
     * y que todavía cumpla las condiciones de cancelación.
     *
     * Envía la solicitud al backend mediante
     * AdminApiService.cancelarReservaPaciente().
     *
     * Si la operación es exitosa:
     * - Finaliza el estado de cancelación.
     * - Cierra el diálogo de confirmación.
     * - Muestra un mensaje de éxito.
     * - Vuelve a consultar los turnos del paciente.
     *
     * Si ocurre un error, muestra el mensaje correspondiente
     * y permite intentar nuevamente la operación.
     */
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

    /**
     * Navega al formulario de creación de reservas del paciente.
     *
     * Utiliza Router para acceder a la ruta /reservas/nueva,
     * donde el usuario puede solicitar un nuevo turno médico.
     */
    irACrearReserva(): void {
        this.router.navigate(['/reservas/nueva']);
    }
}
