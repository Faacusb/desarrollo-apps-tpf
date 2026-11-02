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

/**
 * Componente de creación de reservas para pacientes.
 *
 * Permite al paciente autenticado solicitar un turno médico
 * seleccionando un médico, una fecha y un horario disponible.
 *
 * Consulta los médicos registrados y los horarios libres
 * mediante AdminApiService, que se comunica con la API NestJS.
 *
 * Utiliza AuthStore para obtener el identificador del paciente
 * autenticado y asociarlo a la nueva reserva.
 *
 * Valida que los campos estén completos, que la fecha esté
 * dentro de los próximos 30 días y que el horario elegido
 * se encuentre entre los horarios disponibles.
 *
 * Gestiona los indicadores de carga, las confirmaciones,
 * los errores y la navegación hacia la pantalla Mis Turnos.
 */
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

    /**
     * Señal de Angular que almacena la lista de médicos
     * disponibles para seleccionar al crear una reserva.
     *
     * Se actualiza después de consultar el backend.
     */
    medicos = signal<MedicoAdmin[]>([]);

    /**
     * Identificador del médico seleccionado.
     *
     * Es null cuando todavía no se seleccionó un médico.
     */
    idMedico: number | null = null;

    /**
     * Fecha seleccionada para solicitar el turno.
     *
     * Utiliza el formato YYYY-MM-DD.
     */
    fecha = '';

    /**
     * Horario seleccionado para la reserva.
     *
     * Utiliza el formato HH:mm.
     */
    hora = '';

    /**
     * Lista de horarios disponibles para el médico
     * y la fecha seleccionados.
     */
    horarios: string[] = [];

    /**
     * Señal que indica si se está cargando
     * el listado de médicos.
     *
     * Permite mostrar un indicador de carga
     * mientras se espera la respuesta de la API.
     */
    cargandoMedicos = signal(false);

    /**
     * Indica si se está realizando una consulta
     * de horarios disponibles.
     */
    cargandoHorarios = false;

    /**
     * Indica si se está procesando la creación de una reserva.
     *
     * Evita enviar solicitudes duplicadas mientras
     * se está guardando el turno.
     */
    guardando = false;

    /**
     * Indica si se completó correctamente la consulta
     * de horarios disponibles.
     *
     * Se utiliza para comprobar que el paciente haya
     * consultado la disponibilidad antes de reservar.
     */
    horariosConsultados = false;

    /**
     * Mensaje de error mostrado cuando falla la carga
     * de datos, la validación o la creación de la reserva.
     */
    mensajeError = '';

    /**
     * Mensaje de confirmación mostrado después
     * de crear correctamente un turno médico.
     */
    mensajeExito = '';

    /**
     * Identificador de la reserva creada.
     *
     * Se obtiene de la respuesta del backend cuando
     * esta contiene un identificador numérico.
     *
     * Es null cuando todavía no se creó una reserva
     * o no se recibió un identificador válido.
     */
    reservaCreadaId: number | null = null;

    /**
     * Fecha mínima permitida para solicitar un turno.
     *
     * Se establece con la fecha actual
     * en formato YYYY-MM-DD.
     */
    readonly fechaMinima = this.formatearFecha(new Date());

    /**
     * Fecha máxima permitida para solicitar un turno.
     *
     * Se calcula agregando 30 días a la fecha actual
     * y se expresa en formato YYYY-MM-DD.
     */
    readonly fechaMaxima = this.calcularFechaMaxima();

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param apiService Servicio que realiza las peticiones
     * HTTP para consultar médicos, horarios y crear reservas.
     * @param authStore Servicio encargado de administrar la
     * autenticación y obtener el identificador del paciente.
     * @param router Servicio de navegación de Angular.
     * @param cdr Servicio utilizado para actualizar la vista
     * después de recibir las respuestas del backend.
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
     * Inicia la consulta de médicos disponibles
     * cuando se inicializa el componente.
     */
    ngOnInit(): void {
        this.cargarMedicos();
    }

    /**
     * Obtiene los médicos disponibles para solicitar turnos.
     *
     * Realiza una petición HTTP mediante
     * AdminApiService.listarMedicos().
     *
     * Si la consulta es exitosa, actualiza la señal
     * medicos con los resultados recibidos.
     *
     * Gestiona el indicador de carga y los mensajes
     * de error correspondientes.
     */
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

    /**
     * Gestiona el cambio del médico seleccionado.
     *
     * Limpia el horario anterior, la lista de horarios
     * disponibles y el estado de la consulta.
     *
     * Si existe una fecha seleccionada, consulta nuevamente
     * los horarios disponibles del nuevo médico.
     */
    onMedicoChange(): void {

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    /**
     * Gestiona el cambio de la fecha seleccionada.
     *
     * Limpia el horario anterior, la disponibilidad
     * y el estado de la consulta.
     *
     * Si existe un médico seleccionado, realiza
     * una nueva consulta de horarios disponibles.
     */
    onFechaChange(): void {

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    /**
     * Consulta los horarios disponibles para una reserva.
     *
     * Comprueba que exista un médico seleccionado
     * y que se haya ingresado una fecha.
     *
     * Utiliza AdminApiService.obtenerHorarios()
     * para consultar la disponibilidad del backend.
     *
     * Si la consulta es exitosa, guarda los horarios
     * recibidos y marca la consulta como realizada.
     *
     * Si ocurre un error, limpia los horarios
     * y muestra el mensaje correspondiente.
     */
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

    /**
     * Valida los datos ingresados para solicitar un turno.
     *
     * Comprueba que:
     * - Se haya seleccionado un médico.
     * - La fecha y el horario estén completos.
     * - La fecha esté dentro de los próximos 30 días.
     * - Se hayan consultado los horarios disponibles.
     * - El horario seleccionado se encuentre disponible.
     *
     * Si alguna condición no se cumple, establece
     * un mensaje descriptivo en mensajeError.
     *
     * @returns true cuando el formulario es válido;
     * false cuando existe algún dato incorrecto.
     */
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

    /**
     * Procesa la creación de una reserva del paciente autenticado.
     *
     * Comprueba que no exista otra operación de guardado
     * en curso y valida los datos del formulario.
     *
     * Obtiene el identificador del paciente mediante
     * AuthStore y prepara los datos de la reserva.
     *
     * Envía la solicitud al backend utilizando
     * AdminApiService.crearReservaPaciente().
     *
     * Si la operación es exitosa:
     * - Recupera el identificador de la reserva si está disponible.
     * - Muestra un mensaje de confirmación.
     * - Limpia el horario seleccionado.
     * - Finaliza el indicador de guardado.
     * - Actualiza los horarios disponibles.
     *
     * Si ocurre un error, muestra el mensaje correspondiente
     * sin registrar la reserva como creada en la interfaz.
     */
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

    /**
     * Navega a la pantalla Mis Turnos del paciente.
     *
     * Utiliza Router para regresar a /reservas,
     * donde se consultan los turnos registrados.
     */
    volverAMisTurnos(): void {
        this.router.navigate(['/reservas']);
    }

    /**
     * Convierte una fecha a una cadena con formato YYYY-MM-DD.
     *
     * Obtiene el año, mes y día de la fecha recibida
     * y construye el formato utilizado por el formulario.
     *
     * @param fecha Fecha que se desea convertir.
     * @returns Fecha expresada en formato YYYY-MM-DD.
     */
    private formatearFecha(fecha: Date): string {

        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const dia = String(fecha.getDate()).padStart(2, '0');

        return `${anio}-${mes}-${dia}`;
    }

    /**
     * Calcula la fecha máxima permitida para una reserva.
     *
     * Obtiene la fecha actual, le suma 30 días
     * y utiliza formatearFecha() para generar
     * el valor correspondiente al formulario.
     *
     * @returns Fecha máxima permitida en formato YYYY-MM-DD.
     */
    private calcularFechaMaxima(): string {

        const fecha = new Date();

        fecha.setDate(fecha.getDate() + 30);

        return this.formatearFecha(fecha);
    }
}
