import { Component, OnInit, signal,ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
    MedicoAdmin,
    CrearReservaAdmin,
    HorariosDisponibles
} from '../../admin/admin.models';

import { AdminApiService } from '../../admin/admin-api.services';
import { AuthStore } from '../../auth/auth-store';

@Component({
    selector: 'app-crear-reserva-paciente',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule
    ],
    templateUrl: './crear-reserva.html',
    styleUrl: './crear-reserva.css'
})
export class CrearReservaPacienteComponent implements OnInit {

    medicos = signal<MedicoAdmin[]>([]);



    idMedico: number | null = null;

    fecha = '';
    hora = '';

    horarios: string[] = [];

    cargandoMedicos = signal(false);
    cargandoHorarios = false;
    guardando = false;

    horariosConsultados = false;

    mensajeError = '';
    mensajeExito = '';

    reservaCreadaId: number | null = null;

    readonly fechaMinima = this.formatearFecha(new Date());
    readonly fechaMaxima = this.calcularFechaMaxima();

    constructor(
        private readonly apiService: AdminApiService,
        private readonly authStore: AuthStore,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef
    ) {}

    ngOnInit(): void {
        this.cargarMedicos();
    }

    // Cargar médicos disponibles
    cargarMedicos(): void {

        this.cargandoMedicos.set(true);
        this.mensajeError = '';

        this.apiService.listarMedicos().subscribe({

            next: (medicos) => {

                console.log('Médicos recibidos:', medicos);

                this.medicos.set(medicos);
                this.cargandoMedicos.set(false);

            },

            error: (error) => {

                console.error('Error al obtener médicos:', error);

                this.mensajeError =
                    error.error?.message ||
                    'No se pudo cargar la lista de médicos.';

                this.cargandoMedicos.set(false);
            }
        });
    }

    // Cuando cambia el médico
    onMedicoChange(): void {

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    // Cuando cambia la fecha
    onFechaChange(): void {

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    // Consultar horarios disponibles
    cargarHorarios(): void {

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

    // Validar formulario
    validarFormulario(): boolean {

        if (
            this.idMedico === null ||
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
                'Primero consultá los horarios disponibles.';

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

    // Crear reserva para el paciente autenticado
    guardar(): void {

        if (this.guardando) {
            return;
        }

        if (!this.validarFormulario()) {
            return;
        }

        const idPaciente = this.authStore.obtenerIdUsuario();

        if (idPaciente === null) {

            this.mensajeError =
                'No se pudo identificar al paciente. Iniciá sesión nuevamente.';

            return;
        }

        if (this.idMedico === null) {
            return;
        }

        const datos: CrearReservaAdmin = {
            fecha: this.fecha,
            hora: this.hora,
            idMedico: this.idMedico,
            idPaciente
        };

        this.guardando = true;
        this.mensajeError = '';
        this.mensajeExito = '';
        this.reservaCreadaId = null;

        this.apiService.crearReservaPaciente(datos).subscribe({

            next: (respuesta) => {

                 console.log('Respuesta del backend:', respuesta);

                // Comprobar si el backend devolvió un ID
                const id = (
                    typeof respuesta === 'object' &&
                    respuesta !== null &&
                    'id' in respuesta &&
                    typeof respuesta.id === 'number'
                ) ? respuesta.id : null;

                this.reservaCreadaId = id;

                this.mensajeExito =
                    `¡Turno reservado correctamente! Número: ${id}.`;

                this.hora = '';
                this.guardando = false;

                this.cdr.detectChanges();

                // Actualizar horarios después de la reserva
                this.cargarHorarios();
            },

            error: (error) => {

                console.error('Error al crear reserva:', error);
                console.error('Estado HTTP:', error.status);
                console.error('Respuesta:', error.error);

                this.mensajeError =
                    error.error?.message ||
                    'No se pudo crear la reserva.';

                this.guardando = false;

                this.cdr.detectChanges();   
            }
        });
    }

    // Volver a Mis turnos
    volverAMisTurnos(): void {
        this.router.navigate(['/reservas']);
    }

    // Formatear fecha
    private formatearFecha(fecha: Date): string {

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    // Calcular fecha máxima: 30 días
    private calcularFechaMaxima(): string {

        const fecha = new Date();

        fecha.setDate(fecha.getDate() + 30);

        return this.formatearFecha(fecha);
    }
}