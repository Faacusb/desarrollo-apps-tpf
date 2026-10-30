import { Component, signal, ChangeDetectorRef } from "@angular/core";
import { MedicoAdmin, ReservaAdmin, ReservaFiltros } from "../admin.models";
import { CommonModule, DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { FormsModule } from "@angular/forms";


@Component({
    selector: 'app-admin-medicos-lista',
    standalone: true,
    imports: [CommonModule,DatePipe, TableModule,ButtonModule, DialogModule, FormsModule],
    templateUrl: './medicos-lista.html',
    styleUrl: './medicos-lista.css'
})
export class MedicosLista {
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
    nuevaTarifa: number = 0;
    guardando: boolean= false;
    errorTarifa: string = '';
    visible = signal(false);

    cargarMedicos(): {
        this.apiService.listarMedicos();
        
    }
    abrirEdicion(medico){}
    cerrarEdicion(){}
    validarTarifa(){

    }
    guardarTarifa(){

    }
    actualizarMedicoEnLista(id, valor){
        
    }
}