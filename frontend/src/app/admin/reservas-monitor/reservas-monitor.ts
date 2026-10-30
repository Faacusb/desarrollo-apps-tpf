import { Component, signal, ChangeDetectorRef } from "@angular/core";
import { EstadosReservas, MedicoAdmin, ReservaAdmin, ReservaFiltros } from "../admin.models";
import { CommonModule, DatePipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { esReservaCancelable } from "../admin.utils";
import { FormsModule } from "@angular/forms";


@Component({
    selector: 'app-admin-reservas-monitor',
    standalone: true,
    imports: [CommonModule,DatePipe, TableModule,ButtonModule, DialogModule, FormsModule],
    templateUrl: './reservas-monitor.html',
    styleUrl: './reservas-monitor.css'
})
export class MonitorReservas {

    // Inyectar servicios
    constructor(
        private readonly apiService: AdminApiService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    reservas: ReservaAdmin[] = [];
    medicos: MedicoAdmin[] = [];
    //estados = ESTADOS_RESERVA;
    filtros: ReservaFiltros = {estado: null, idMedico: null, desde: null, hasta: null}
    cargando: boolean = false;
    cargandoMedicos: boolean = false;
    consultaRealizada: boolean = false;
    mensajeError: string = '';
    mensajeExito: string = '';
    fechaSeleccionada: string = '';

    dialogoVisible = signal(false);
    reservaSeleccionada: ReservaAdmin | null = null;
    cancelando: boolean = false;

    //metodos
    cargarReservas(){
        // Limpiar resultados y mensajes anteriores
        this.reservas = [];
        this.mensajeError = '';
        this.mensajeExito = '';
        this.consultaRealizada = false;

        // Obtener el token JWT
        const token = sessionStorage.getItem('accessToken');

        if (!token) {
            this.mensajeError = 'Debés iniciar sesión como administrador.';
            return;
        }


        // Activar indicador de carga
        this.cargando = true;

        // Consultar el backend NestJS
        this.apiService.listarReservas(this.filtros)
            .subscribe({

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

            // Error al consultar la agenda
            error: (error) => {

                this.cargando = false;
                this.consultaRealizada = false;

                if (error.status === 401) {
                    this.mensajeError =
                        'Tu sesión no es válida o ha expirado.';
                } else if (error.status === 403) {
                    this.mensajeError =
                        'No tenés permiso para consultar esta consulta.';
                } else if (error.status === 400) {
                    this.mensajeError =
                        'La fecha ingresada no es válida.';
                } else {
                    this.mensajeError =
                        'No se pudieron consultar las reservas.';
                }

                console.error('Error al consultar las reservas:', error);

                // Actualizar la vista en caso de error
                this.cdr.markForCheck();
            }
        });
    }

    cargarMedicos(){

    }

    aplicarFiltros(){

    }
    limpiarFiltros(){

    }

    puedeCancelar(reserva: ReservaAdmin): boolean {
        return esReservaCancelable(reserva);
    }
    abrirConfirmacion(reserva: ReservaAdmin): void {
        if (!this.puedeCancelar(reserva)) {
            alert('Este turno ya no se puede cancelar.');
            return;
        }

        this.reservaSeleccionada = reserva;
        this.visible.set(true);
    }
    cerrarConfirmacion(){
        this.visible.set(false);
        this.reservaSeleccionada = null;
    }
    confirmarCancelacion(): void {
        const reserva = this.reservaSeleccionada;

        if(!reserva || !this.puedeCancelar(reserva)) {
            alert('Este turno ya no se puede cancelar.');
            this.cerrarConfirmacion();
            return;
        }
        this.apiService.cancelarReserva(reserva.id);
        this.cerrarConfirmacion();
    }
    actualizarReservaEnLista(id: number, estado: EstadosReservas) {

        
    }
}