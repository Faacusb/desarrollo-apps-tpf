import { Component, OnInit } from "@angular/core";
import { MedicoAdmin, PacienteOpcion, CrearReservaAdmin, HorariosDisponibles} from "../admin.models";
import { CommonModule} from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { Router } from '@angular/router';


@Component({
    selector: 'app-admin-reserva-form',
    standalone: true,
    imports: [CommonModule,FormsModule, TableModule,ButtonModule, DialogModule],
    templateUrl: './reservas-form.html',
    styleUrl: './reservas-form.css'
})
export class ReservaForm implements OnInit {

    medicos: MedicoAdmin[] = [];
    pacientes: PacienteOpcion[] = [];

    idMedico: number | null = null;
    idPaciente: number | null = null;

    fecha: string = '';
    hora: string = '';

    horarios: string[] = [];

    cargandoMedicos: boolean = false;
    cargandoPacientes: boolean = false;
    cargandoHorarios: boolean = false;
    guardando: boolean = false;

    horariosConsultados: boolean = false;

    mensajeError: string = '';
    mensajeExito: string = '';

   reservaCreadaId: number | null = null;

    readonly fechaMinima = this.formatearFecha(new Date());
    readonly fechaMaxima = this.calcularFechaMaxima();
    
    // Inyectar servicios
    constructor(
        private readonly apiService: AdminApiService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        this.cargarMedicos();
        this.cargarPacientes();
    }

    //obtener los medicos
    cargarMedicos(): void{
        this.cargandoMedicos = true;
        this.mensajeError = '';

        this.apiService.listarMedicos().subscribe({
            next: (medicos) => {
                this.medicos = medicos;
                this.cargandoMedicos = false;
            },

            error: (error) => {
                console.error('Error al obtener los médicos:', error);

                this.mensajeError = error.error?.message || 'No se pudo obtener la lista de médicos.';

                this.cargandoMedicos = false;
            }
        });
    }

    //obtener los pacientes
    cargarPacientes(): void {
        this.cargandoPacientes = true;

        this.apiService.listarPacientes().subscribe({

            next: (pacientes) => {
                this.pacientes = pacientes;
                this.cargandoPacientes = false;
            },
            error: (error) => {
                console.error('Error al obtener los pacientes:', error);

                this.mensajeError = error.error?.message || 'No se pudo obtener la lista de pacientes.';

                this.cargandoPacientes = false;
            }
        });
    }

    //cuando cambia el medico seleccionado
    onMedicoChange(): void{

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }

    }

    //cuando cambia la fecha seleccionada
    onFechaChange(): void{

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    //horarios disponibles para el medico y fecha seleccionados
    cargarHorarios(): void{

        const idMedico = this.idMedico;
        const fecha = this.fecha;

        if (idMedico === null || !fecha) {
            return;
        }

        this.cargandoHorarios = true;
        this.horariosConsultados = false;
        this.mensajeError = '';

        this.apiService.obtenerHorarios(fecha, idMedico).subscribe({

            next: (respuesta: HorariosDisponibles) => {

                this.horarios = respuesta.disponibles ?? [];

                this.horariosConsultados = true;
                this.cargandoHorarios = false;
            },

            error: (error) => {

                console.error('Error al consultar horarios:', error);

                this.mensajeError =
                    error.error?.message ||
                    'No se pudieron consultar los horarios disponibles.';

                this.horarios = [];
                this.horariosConsultados = false;
                this.cargandoHorarios = false;
            }
        });
    }

    //validar los datos del formulario
    validarFormulario(): boolean {

        if (
            this.idMedico === null ||
            this.idPaciente === null ||
            !this.fecha ||
            !this.hora
        ) {
            this.mensajeError = 'Completá todos los campos.';
            return false;
        }

        if (
            this.fecha < this.fechaMinima ||
            this.fecha > this.fechaMaxima
        ) {
            this.mensajeError =
                'La fecha debe estar dentro de los próximos 30 días.';

            return false;
        }

        if (!this.horariosConsultados) {
            this.mensajeError =
                'Primero tenés que consultar los horarios disponibles.';

            return false;
        }

        if (!this.horarios.includes(this.hora)) {
            this.mensajeError =
                'Seleccioná un horario disponible.';

            return false;
        }

        this.mensajeError = '';
        return true;
    }

    //crear la reserva
    guardar(): void{

        if (!this.validarFormulario()) {
            return;
        }

        const idMedico = this.idMedico;
        const idPaciente = this.idPaciente;
        const fecha = this.fecha;
        const hora = this.hora;

        if (idMedico === null || idPaciente === null) {
            return;
        }

        const datos: CrearReservaAdmin = {
            fecha,
            hora,
            idMedico,
            idPaciente
        };

        this.guardando = true;
        this.mensajeError = '';
        this.mensajeExito = '';
        this.reservaCreadaId = null;

        this.apiService.crearReserva(datos).subscribe({

            next: (respuesta) => {

                this.reservaCreadaId = respuesta.id;

                this.mensajeExito =
                    `Reserva creada correctamente. Número: ${respuesta.id}.`;

                this.hora = '';
                this.guardando = false;

                // Actualizar los horarios disponibles
                this.cargarHorarios();
            },

            error: (error) => {

                console.error('Error al crear reserva:', error);

                this.mensajeError =
                    error.error?.message ||
                    'No se pudo crear la reserva.';

                this.guardando = false;
            }
        });
    }

    //limpiar el formulario
    limpiar(): void {

        if (this.guardando) {
            return;
        }

        this.idMedico = null;
        this.idPaciente = null;

        this.fecha = '';
        this.hora = '';

        this.horarios = [];
        this.horariosConsultados = false;

        this.mensajeError = '';
        this.mensajeExito = '';
        this.reservaCreadaId = null;
    }


    irAlMonitor(): void {
        this.router.navigate(['/admin/reservas']);
    }

    // Formatear fecha para el input date
    private formatearFecha(fecha: Date): string {

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    // Calcular el límite de 30 días
    private calcularFechaMaxima(): string {

        const fecha = new Date();

        fecha.setDate(fecha.getDate() + 30);

        return this.formatearFecha(fecha);
    }
    
}