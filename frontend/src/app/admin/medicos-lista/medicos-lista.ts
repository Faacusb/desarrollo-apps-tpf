import { Component, OnInit, signal, ChangeDetectorRef } from "@angular/core";
import { MedicoAdmin } from "../admin.models";
import { CommonModule, DatePipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { FormsModule } from "@angular/forms";


@Component({
    selector: 'app-admin-medicos-lista',
    standalone: true,
    imports: [CommonModule, TableModule,ButtonModule, DialogModule, FormsModule],
    templateUrl: './medicos-lista.html',
    styleUrl: './medicos-lista.css'
})
export class MedicosLista implements OnInit {
    // Inyectar servicios
    constructor(
        private readonly apiService: AdminApiService,
        private readonly cdr: ChangeDetectorRef
    ) {}
    
    medicos: MedicoAdmin[] = [];
    cargando: boolean = false;
    consultaRealizada: boolean = false;
    mensajeError: string = '';
    mensajeExito: string = '';
    
    medicoSeleccionado: MedicoAdmin | null = null;
    nuevaTarifa: number | null = null;
    guardando: boolean= false;
    errorTarifa: string = '';
    visible = signal(false);

    ngOnInit(): void {
        this.cargarMedicos();
    }

    //obtener todos los medicos
    cargarMedicos(): void {
        this.cargando = true;
        this.mensajeError = '';

        this.apiService.listarMedicos().subscribe({
            next: (medicos) => {
                this.medicos = medicos;
                this.cargando = false;
                this.consultaRealizada = true;

                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error al obtener los médicos:', error);

                this.mensajeError = error.error?.message || 'No se pudo obtener la lista de médicos.';
                this.cargando = false;
                this.consultaRealizada = true;

                this.cdr.detectChanges();
            },
        });        
    }

    //abrir ventana de edicion de tarifa
    abrirEdicion(medico: MedicoAdmin): void {
        this.medicoSeleccionado = medico;
        this.nuevaTarifa = medico.valorConsulta;
        this.errorTarifa = '';
        this.visible.set(true);
    }

    //cerrar ventana de edicion 
    cerrarEdicion(): void {
        if (this.guardando) {
            return; // Evitar cerrar mientras se está guardando
        }
        this.visible.set(false);
        this.medicoSeleccionado = null;
        this.nuevaTarifa = null;
        this.errorTarifa = '';
    }

    //validar la nueva tarifa
    validarTarifa(): boolean {
        if (
            this.nuevaTarifa === null ||
            !Number.isFinite(this.nuevaTarifa) ||
            !Number.isInteger(this.nuevaTarifa) ||
            this.nuevaTarifa <= 0
        ) {
            this.errorTarifa = 'La tarifa debe ser un número entero mayor a cero.';
            return false;
        }

        this.errorTarifa = '';
        return true;
    }

    //guardar nueva tarifa
    guardarTarifa(): void{
        if (!this.medicoSeleccionado || !this.validarTarifa()) {
            return;
        }

        const id = this.medicoSeleccionado.id;
        const valor = this.nuevaTarifa;

        if (valor === null || !this.validarTarifa()) {
            return;
        }

        this.guardando = true;
        this.errorTarifa = '';
        this.mensajeExito = '';

        this.apiService.actualizarTarifa(id, valor).subscribe({

            next: () => {

                this.actualizarMedicoEnLista(id, valor);
                this.guardando = false;
                this.cerrarEdicion();

                this.mensajeExito = 'Tarifa actualizada correctamente.';
            },

            error: (error) => {
                console.error('Error al actualizar la tarifa:', error);

                this.errorTarifa = error.error?.message || 'No se pudo actualizar la tarifa.';
                this.guardando = false;
            },
        });
    }

    //actualizar la tarifa del medico en la lista
    actualizarMedicoEnLista(id: number, valor: number): void{
        
        this.medicos = this.medicos.map((medico) =>
            medico.id === id 
        ? { ...medico, valorConsulta: valor } : medico,
        );
    }
}