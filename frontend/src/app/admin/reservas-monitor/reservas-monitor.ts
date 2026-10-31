import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

import { AdminApiService } from "../admin-api.services";
import { esReservaCancelable, mensajeDeError } from "../admin.utils";
import { ESTADOS_RESERVAS, EstadosReservas, MedicoAdmin, ReservaAdmin, ReservaFiltros } from "../admin.models";


@Component({
    selector: 'app-admin-reservas-monitor',
    standalone: true,
    imports: [CommonModule, TableModule, ButtonModule, DialogModule, FormsModule],
    templateUrl: './reservas-monitor.html',
    styleUrl: './reservas-monitor.css'
})
export class MonitorReservas implements OnInit{

    reservas: ReservaAdmin[] = [];
    medicos: MedicoAdmin[] = [];
    estados = ESTADOS_RESERVAS;
    filtros: ReservaFiltros = {
        estado: null, 
        idMedico: null, 
        desde: null, 
        hasta: null,
    };

    cargando: boolean = false;
    cargandoMedicos: boolean = false;
    consultaRealizada: boolean = false;

    mensajeError: string = '';
    mensajeErrorMedicos: string = "";
    mensajeExito: string = '';

    dialogoVisible: boolean = false;
    reservaSeleccionada: ReservaAdmin | null = null;
    cancelando: boolean = false;

    // Inyectar servicios
    constructor(
        private readonly apiService: AdminApiService,
        private readonly cdr: ChangeDetectorRef
    ) {}
    
    //metodos
    ngOnInit(): void {
        if (!sessionStorage.getItem("accessToken")) {
            this.mensajeError = "Debés iniciar sesión como administrador.";
            this.cdr.markForCheck();
            return;
        }

        this.cargarMedicos();
        this.cargarReservas();
    }

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

    aplicarFiltros(): void {
        this.mensajeExito = "";

        if ( this.filtros.desde && this.filtros.hasta && this.filtros.desde > this.filtros.hasta ) {
            this.mensajeError = "La fecha desde no puede ser posterior a la fecha hasta.";
            this.cdr.markForCheck();
            return;
        }
        this.cargarReservas();
    }

    limpiarFiltros(): void {
        this.filtros = {
            estado: null,
            idMedico: null,
            desde: null,
            hasta: null,
        };

        this.cargarReservas();

    }

    puedeCancelar(reserva: ReservaAdmin): boolean {
        return esReservaCancelable(reserva);
    }

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
    cerrarConfirmacion(): void {
        if (this.cancelando) {
            return;
        }
        this.dialogoVisible = false;
        this.reservaSeleccionada = null;
        this.cdr.markForCheck();
    }

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

    actualizarReservaEnLista(id: number, estado: EstadosReservas): void {
        this.reservas = this.reservas.map((reserva) => 
            reserva.id === id ? {...reserva, estado }: reserva
        );
    }
}