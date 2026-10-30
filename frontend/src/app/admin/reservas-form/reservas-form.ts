import { Component, signal, ChangeDetectorRef } from "@angular/core";
import { MedicoAdmin, PacienteOpcion, ReservaAdmin, ReservaFiltros } from "../admin.models";
import { CommonModule, DatePipe } from "@angular/common";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";


@Component({
    selector: 'app-admin-reserva-form',
    standalone: true,
    imports: [CommonModule,DatePipe, TableModule,ButtonModule, DialogModule],
    templateUrl: './reserva-form.html',
    styleUrl: './reserva-form.css'
})
export class ReservaForm {
    medicos: MedicoAdmin[] = [];
    pacientes: PacienteOpcion[] = [];
    idMedico: any = '';
    idPaciente: any = '';
    fecha: any = '';
    hora: any = '';
    horarios: string[] = [];
    cargandoMedicos: boolean = false;
    cargandoPacientes: boolean = false;
    cargandoHorarios: boolean = false;
    horariosConsultados: boolean = false;
    mensajeError: string = '';
    mensajeExito: string = '';
    reservaCreadaId: any = '';
    
    // Inyectar servicios
    constructor(
        private readonly http: HttpClient,
        private readonly cdr: ChangeDetectorRef
    ) {}

    cargarMedicos(){

    }
    cargarPacientes(){

    }
    onMedicoChange(){

    }
    onFechaChange(){

    }
    cargarHorarios(){

    }
    validarFormulario(){

    }
    guardar(){

    }
    limpiar(){}
    irAlMonitor(){}
    
}