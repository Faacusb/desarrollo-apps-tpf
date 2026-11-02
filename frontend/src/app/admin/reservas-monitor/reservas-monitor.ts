import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { AdminApiService } from "../admin-api.services";
import { esReservaCancelable, mensajeDeError } from "../admin.utils";
import { ESTADOS_RESERVAS, EstadosReservas, MedicoAdmin, ReservaAdmin, ReservaFiltros } from "../admin.models";

/**
 * Componente de monitoreo y administración de reservas médicas.
 *
 * Permite consultar las reservas registradas en el sistema,
 * aplicar filtros de búsqueda y cancelar turnos disponibles
 * para dicha operación.
 *
 * Los filtros permiten buscar por estado, médico
 * y un intervalo de fechas.
 *
 * Utiliza AdminApiService para comunicarse con el backend
 * NestJS y los componentes de PrimeNG para mostrar
 * la tabla de reservas y el diálogo de confirmación.
 *
 * Gestiona los estados de carga, los mensajes de error
 * y las confirmaciones de cancelación.
 */
@Component({
    selector: 'app-admin-reservas-monitor',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule],
    templateUrl: './reservas-monitor.html',
    styleUrl: './reservas-monitor.css'
})
export class MonitorReservas implements OnInit {

    /**
     * Lista de reservas obtenidas desde el backend.
     *
     * Contiene las reservas que coinciden con
     * los filtros seleccionados por el administrador.
     */
    reservas: ReservaAdmin[] = [];

    /**
     * Lista de médicos disponibles para filtrar reservas.
     *
     * Se obtiene mediante AdminApiService.
     */
    medicos: MedicoAdmin[] = [];

    /**
     * Opciones disponibles para el filtro de estados.
     *
     * Incluye todos los estados posibles de una reserva
     * y la opción de mostrar todas las reservas.
     */
    estados = ESTADOS_RESERVAS;

    /**
     * Criterios de búsqueda utilizados para consultar reservas.
     *
     * Permite seleccionar un estado, un médico
     * y un intervalo de fechas.
     *
     * Inicialmente todos los filtros están desactivados.
     */
    filtros: ReservaFiltros = {
        estado: null,
        idMedico: null,
        desde: null,
        hasta: null,
    };

    /**
     * Indica si se está realizando una consulta de reservas.
     */
    cargando: boolean = false;

    /**
     * Indica si se está cargando el listado de médicos.
     */
    cargandoMedicos: boolean = false;

    /**
     * Indica si la última consulta de reservas
     * finalizó correctamente.
     *
     * Permite distinguir una consulta exitosa sin resultados
     * de una consulta que todavía no se realizó.
     */
    consultaRealizada: boolean = false;

    /**
     * Mensaje de error asociado a la consulta
     * o cancelación de reservas.
     */
    mensajeError: string = '';

    /**
     * Mensaje de error mostrado cuando falla
     * la carga del listado de médicos.
     */
    mensajeErrorMedicos: string = "";

    /**
     * Mensaje de confirmación mostrado después
     * de cancelar correctamente una reserva.
     */
    mensajeExito: string = '';

    /**
     * Controla la visibilidad del diálogo
     * de confirmación de cancelación.
     */
    dialogoVisible: boolean = false;

    /**
     * Reserva seleccionada para realizar una cancelación.
     *
     * Su valor es null cuando no hay
     * una reserva seleccionada.
     */
    reservaSeleccionada: ReservaAdmin | null = null;

    /**
     * Indica si se está procesando una cancelación.
     *
     * Evita enviar solicitudes duplicadas
     * o cerrar el diálogo durante la operación.
     */
    cancelando: boolean = false;

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param apiService Servicio encargado de consultar
     * y administrar las reservas mediante la API REST.
     * @param cdr Servicio utilizado para actualizar
     * la vista de Angular después de las operaciones.
     */
    constructor(
        private readonly apiService: AdminApiService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    /**
     * Método del ciclo de vida de Angular.
     *
     * Comprueba que exista un token JWT almacenado
     * en Session Storage.
     *
     * Si no existe, muestra un mensaje solicitando
     * que el usuario inicie sesión como administrador.
     *
     * Si existe un token, inicia la carga
     * del listado de médicos y de las reservas.
     */
    ngOnInit(): void {
        if (!sessionStorage.getItem("accessToken")) {
            this.mensajeError = "Debés iniciar sesión como administrador.";
            this.cdr.markForCheck();
            return;
        }

        this.cargarMedicos();
        this.cargarReservas();
    }

    /**
     * Consulta las reservas registradas en el sistema.
     *
     * Envía los filtros seleccionados al backend mediante
     * AdminApiService.listarReservas().
     *
     * Antes de realizar la petición, limpia los resultados
     * y los mensajes anteriores.
     *
     * Cuando la consulta es exitosa, actualiza la lista
     * de reservas y finaliza el indicador de carga.
     *
     * Si ocurre un error, genera un mensaje mediante
     * la función auxiliar mensajeDeError().
     */
    cargarReservas(){
        // Limpiar resultados y mensajes anteriores
        this.reservas = [];
        this.mensajeError = '';
        this.mensajeExito = '';
        this.consultaRealizada = false;
        this.cargando = true;
        this.cdr.markForCheck();

        // Consulto el backend
        this.apiService.listarReservas(this.filtros).subscribe({
            // Consulta exitosa
            next: (respuesta) => {
                // Guardar las reservas recibidas
                this.reservas = respuesta;

                // Finalizar carga
                this.cargando = false;

                // Indicar que la consulta se realizó correctamente
                this.consultaRealizada = true;
                // Actualizar la vista de Angular
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.cargando = false;
                this.consultaRealizada = false;

                this.mensajeError = mensajeDeError(error);
                // Actualizar la vista en caso de error
                this.cdr.markForCheck();
            },
        });
    }

    /**
     * Obtiene el listado de médicos del sistema.
     *
     * Utiliza AdminApiService.listarMedicos()
     * para cargar las opciones del filtro por médico.
     *
     * Gestiona el indicador de carga y los errores
     * que puedan producirse durante la petición.
     */
    cargarMedicos(): void {
        this.cargandoMedicos = true;
        this.mensajeErrorMedicos = "";
        this.cdr.markForCheck();

        this.apiService.listarMedicos().subscribe({
            // Consulta exitosa
            next: (respuesta) => {
                // Guardar los medicos recibidos
                this.medicos = respuesta;
                this.cargandoMedicos = false;
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.cargandoMedicos = false;
                this.mensajeErrorMedicos = mensajeDeError(error);
                // Actualizar la vista en caso de error
                this.cdr.markForCheck();
            },
        });
    }

    /**
     * Aplica los filtros seleccionados a la consulta de reservas.
     *
     * Comprueba que la fecha inicial no sea posterior
     * a la fecha final del intervalo.
     *
     * Si el intervalo es incorrecto, muestra un error.
     * En caso contrario, ejecuta una nueva consulta
     * utilizando los filtros actuales.
     */
    aplicarFiltros(): void {
        this.mensajeExito = "";

        if ( this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta ) {
            this.mensajeError = "La fecha desde no puede ser posterior a la fecha hasta.";
            this.cdr.markForCheck();
            return;
        }
        this.cargarReservas();
    }

    /**
     * Restablece todos los filtros de búsqueda.
     *
     * Elimina los criterios de estado, médico
     * y fechas, y realiza una nueva consulta
     * para obtener todas las reservas.
     */
    limpiarFiltros(): void {
        this.filtros = {
            estado: null,
            idMedico: null,
            desde: null,
            hasta: null,
        };

        this.cargarReservas();

    }

    /**
     * Determina si una reserva puede ser cancelada.
     *
     * Utiliza la función auxiliar esReservaCancelable()
     * para verificar que la reserva esté activa
     * y que su fecha y hora sean futuras.
     *
     * @param reserva Reserva que se desea evaluar.
     * @returns true si la reserva puede cancelarse;
     * false en caso contrario.
     */
    puedeCancelar(reserva: ReservaAdmin): boolean {
        return esReservaCancelable(reserva);
    }

    /**
     * Abre el diálogo de confirmación de cancelación.
     *
     * Primero verifica que la reserva seleccionada
     * cumpla las condiciones para ser cancelada.
     *
     * Si no puede cancelarse, muestra un mensaje de error.
     *
     * Si la reserva es cancelable, guarda la selección,
     * limpia los mensajes anteriores y abre el diálogo.
     *
     * @param reserva Reserva que el administrador
     * desea cancelar.
     */
    abrirConfirmacion(reserva: ReservaAdmin): void {
        if (!this.puedeCancelar(reserva)) {
            this.mensajeError = "Este turno ya no puede ser cancelado.";
            this.mensajeExito = "";
            this.cdr.markForCheck();
            return;
        }

        this.reservaSeleccionada = reserva;
        this.mensajeError = "";
        this.mensajeExito = "";
        this.dialogoVisible = true;
        this.cdr.markForCheck();
    }

    /**
     * Cierra el diálogo de confirmación de cancelación.
     *
     * Impide cerrar la ventana mientras se está
     * procesando una cancelación.
     *
     * Cuando puede cerrarse, limpia la reserva
     * seleccionada y actualiza la vista.
     */
    cerrarConfirmacion(): void {
        if (this.cancelando) {
            return;
        }
        this.dialogoVisible = false;
        this.reservaSeleccionada = null;
        this.cdr.markForCheck();
    }

    /**
     * Confirma y procesa la cancelación de una reserva.
     *
     * Comprueba que no exista otra cancelación en curso
     * y que la reserva seleccionada pueda cancelarse.
     *
     * Envía una petición al backend mediante
     * AdminApiService.cancelarReserva().
     *
     * Si la operación es exitosa:
     * - Actualiza el estado de la reserva a CANCELADO.
     * - Finaliza el indicador de cancelación.
     * - Muestra un mensaje de confirmación.
     * - Cierra el diálogo.
     *
     * Si ocurre un error, muestra el mensaje
     * correspondiente y cierra la ventana.
     */
    confirmarCancelacion(): void {
        if (this.cancelando) {
            return;
        }
        const reserva = this.reservaSeleccionada;

        if(!reserva || !this.puedeCancelar(reserva)) {
            this.mensajeError = "Este turno ya no puede ser cancelado.";
            this.cerrarConfirmacion();
            return;
        }

        const id = reserva.id;

        this.cancelando = true;
        this.mensajeError = "";
        this.mensajeExito = "";
        this.cdr.markForCheck();

        this.apiService.cancelarReserva(id).subscribe({
            next: () => {
                this.actualizarReservaEnLista(id, "CANCELADO");
                this.cancelando = false;
                this.mensajeExito = "La reserva se canceló de forma correcta.";
                this.cerrarConfirmacion();
                this.cdr.markForCheck();
            },
            error: (error) => {
                this.cancelando = false;
                this.mensajeError = mensajeDeError(error);
                this.cerrarConfirmacion();
                this.cdr.markForCheck();
            },
        });
    }

    /**
     * Actualiza localmente el estado de una reserva.
     *
     * Recorre la lista de reservas y modifica
     * el estado de la reserva cuyo identificador coincide.
     *
     * Esta operación actualiza los datos mostrados
     * en la interfaz sin realizar otra petición HTTP.
     *
     * @param id Identificador de la reserva actualizada.
     * @param estado Nuevo estado de la reserva.
     */
    actualizarReservaEnLista(id: number, estado: EstadosReservas): void {
        this.reservas = this.reservas.map((reserva) =>
            reserva.id === id ? {...reserva, estado }: reserva
        );
    }
}
