import {Component,OnInit,ChangeDetectorRef} from '@angular/core';
import { MedicoAdmin, PacienteOpcion, CrearReservaAdmin, HorariosDisponibles} from "../admin.models";
import { CommonModule} from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { Router } from '@angular/router';

/**
 * Componente de creación administrativa de reservas médicas.
 *
 * Permite a un usuario administrador registrar nuevas reservas
 * seleccionando un médico, un paciente, una fecha y un horario.
 *
 * Consulta los médicos y pacientes disponibles mediante
 * AdminApiService y obtiene los horarios libres del médico
 * para la fecha seleccionada.
 *
 * Valida que todos los datos estén completos, que la fecha
 * esté dentro de los próximos 30 días y que el horario
 * elegido se encuentre disponible.
 *
 * Gestiona los estados de carga, los mensajes de error,
 * la confirmación de creación y la navegación al monitor
 * de reservas.
 */
@Component({
    selector: 'app-admin-reserva-form',
    standalone: true,
    imports: [CommonModule,FormsModule, TableModule,ButtonModule, DialogModule],
    templateUrl: './reservas-form.html',
    styleUrl: './reservas-form.css'
})
export class ReservaForm implements OnInit {

    /**
     * Lista de médicos disponibles para seleccionar
     * durante la creación de una reserva.
     */
    medicos: MedicoAdmin[] = [];

    /**
     * Lista de pacientes disponibles para seleccionar
     * durante la creación de una reserva.
     */
    pacientes: PacienteOpcion[] = [];

    /**
     * Identificador del médico seleccionado.
     *
     * Es null cuando todavía no se seleccionó un médico.
     */
    idMedico: number | null = null;

    /**
     * Identificador del paciente seleccionado.
     *
     * Es null cuando todavía no se seleccionó un paciente.
     */
    idPaciente: number | null = null;

    /**
     * Fecha seleccionada para la nueva reserva.
     *
     * Utiliza el formato YYYY-MM-DD.
     */
    fecha: string = '';

    /**
     * Horario seleccionado para la nueva reserva.
     *
     * Utiliza el formato HH:mm.
     */
    hora: string = '';

    /**
     * Lista de horarios disponibles para el médico
     * y la fecha seleccionados.
     */
    horarios: string[] = [];

    /**
     * Indica si se está consultando el listado de médicos.
     */
    cargandoMedicos: boolean = false;

    /**
     * Indica si se está consultando el listado de pacientes.
     */
    cargandoPacientes: boolean = false;

    /**
     * Indica si se está consultando la disponibilidad
     * de horarios del médico seleccionado.
     */
    cargandoHorarios: boolean = false;

    /**
     * Indica si se está procesando la creación de una reserva.
     *
     * Evita limpiar el formulario mientras
     * se está guardando la información.
     */
    guardando: boolean = false;

    /**
     * Indica si se completó correctamente una consulta
     * de horarios disponibles.
     *
     * Se utiliza para validar que el usuario haya
     * consultado la disponibilidad antes de reservar.
     */
    horariosConsultados: boolean = false;

    /**
     * Mensaje de error utilizado para informar problemas
     * de carga, validación o creación de reservas.
     */
    mensajeError: string = '';

    /**
     * Mensaje de confirmación mostrado después
     * de crear correctamente una reserva.
     */
    mensajeExito: string = '';

    /**
     * Identificador de la reserva creada.
     *
     * Se obtiene de la respuesta del backend cuando
     * esta incluye un ID numérico.
     *
     * Es null cuando no existe una reserva creada
     * o la respuesta no contiene un identificador.
     */
    reservaCreadaId: number | null = null;

    /**
     * Fecha mínima permitida para crear una reserva.
     *
     * Se calcula utilizando la fecha actual y
     * se expresa en formato YYYY-MM-DD.
     */
    readonly fechaMinima = this.formatearFecha(new Date());

    /**
     * Fecha máxima permitida para crear una reserva.
     *
     * Corresponde a 30 días después de la fecha actual.
     */
    readonly fechaMaxima = this.calcularFechaMaxima();

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param apiService Servicio de comunicación con la API
     * para consultar médicos, pacientes, horarios y crear reservas.
     * @param router Servicio de navegación de Angular.
     * @param cdr Servicio utilizado para actualizar
     * la vista después de las operaciones HTTP.
     */
    constructor(
        private readonly apiService: AdminApiService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef

    ) {}

    /**
     * Método del ciclo de vida de Angular.
     *
     * Inicia la carga de los médicos y pacientes
     * disponibles al inicializar el componente.
     */
    ngOnInit(): void {
        this.cargarMedicos();
        this.cargarPacientes();
    }

    /**
     * Obtiene el listado de médicos registrados.
     *
     * Realiza una petición mediante AdminApiService
     * y actualiza la lista de médicos disponibles.
     *
     * Gestiona el estado de carga y muestra
     * un mensaje si ocurre un error.
     */
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

    /**
     * Obtiene el listado de pacientes registrados.
     *
     * Consulta los pacientes mediante AdminApiService
     * y actualiza las opciones disponibles del formulario.
     *
     * Gestiona el estado de carga y los errores
     * devueltos por el backend.
     */
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

    /**
     * Gestiona el cambio del médico seleccionado.
     *
     * Limpia el horario anterior y la lista de
     * horarios disponibles.
     *
     * Si existe un médico seleccionado y una fecha,
     * realiza una nueva consulta de disponibilidad.
     */
    onMedicoChange(): void{

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }

    }

    /**
     * Gestiona el cambio de fecha seleccionada.
     *
     * Limpia el horario anterior y los resultados
     * de disponibilidad.
     *
     * Si existe un médico seleccionado, consulta
     * nuevamente los horarios para la nueva fecha.
     */
    onFechaChange(): void{

        this.hora = '';
        this.horarios = [];
        this.horariosConsultados = false;

        if (this.idMedico !== null && this.fecha) {
            this.cargarHorarios();
        }
    }

    /**
     * Consulta los horarios disponibles de un médico.
     *
     * Verifica que exista un médico seleccionado
     * y que se haya ingresado una fecha.
     *
     * Envía ambos datos al backend mediante
     * AdminApiService.obtenerHorarios().
     *
     * Cuando la consulta es exitosa, guarda los horarios
     * disponibles y marca la consulta como realizada.
     *
     * Si ocurre un error, limpia los horarios
     * y muestra el mensaje correspondiente.
     */
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

    /**
     * Valida los datos ingresados para crear una reserva.
     *
     * Comprueba que:
     * - Se haya seleccionado un médico.
     * - Se haya seleccionado un paciente.
     * - La fecha y el horario estén completos.
     * - La fecha esté dentro de los próximos 30 días.
     * - Se hayan consultado los horarios disponibles.
     * - El horario elegido esté disponible.
     *
     * Si alguna validación falla, establece
     * un mensaje descriptivo en mensajeError.
     *
     * @returns true si todos los datos son válidos;
     * false en caso contrario.
     */
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

    /**
     * Crea una nueva reserva médica desde administración.
     *
     * Primero valida los datos del formulario.
     *
     * Si la validación es exitosa, prepara la información
     * de la reserva y la envía mediante
     * AdminApiService.crearReserva().
     *
     * Cuando la operación es exitosa:
     * - Obtiene el ID de la reserva si está disponible.
     * - Muestra un mensaje de confirmación.
     * - Limpia el horario seleccionado.
     * - Finaliza el estado de guardado.
     * - Actualiza los horarios disponibles.
     *
     * Si ocurre un error, muestra el mensaje correspondiente
     * y permite volver a intentar la operación.
     */
    guardar(): void {

    if (!this.validarFormulario()) {
        return;
    }

    const idMedico = this.idMedico;
    const idPaciente = this.idPaciente;

    if (idMedico === null || idPaciente === null) {
        return;
    }

    const datos: CrearReservaAdmin = {
        fecha: this.fecha,
        hora: this.hora,
        idMedico,
        idPaciente
    };

    console.log('Datos enviados para crear reserva:', datos);

    this.guardando = true;
    this.mensajeError = '';
    this.mensajeExito = '';
    this.reservaCreadaId = null;

    this.apiService.crearReserva(datos).subscribe({

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

            this.mensajeExito = id !== null
                ? `Reserva creada correctamente. Número: ${id}.`
                : 'Reserva creada correctamente.';

            this.hora = '';
            this.guardando = false;

            this.cdr.detectChanges();

            // Actualizar los horarios disponibles
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
     * Limpia los campos y mensajes del formulario.
     *
     * Restablece la selección de médico, paciente,
     * fecha, horario y resultados de disponibilidad.
     *
     * No realiza la limpieza mientras
     * se está guardando una reserva.
     */
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

    /**
     * Navega al monitor administrativo de reservas.
     *
     * Utiliza Router para mostrar la pantalla
     * ubicada en /admin/reservas.
     */
    irAlMonitor(): void {
        this.router.navigate(['/admin/reservas']);
    }

    /**
     * Convierte una fecha a una cadena con formato YYYY-MM-DD.
     *
     * Utiliza los componentes locales de la fecha
     * para construir el valor utilizado por los
     * controles de fecha del formulario.
     *
     * @param fecha Fecha que se desea convertir.
     * @returns Fecha formateada como YYYY-MM-DD.
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
     * Obtiene la fecha actual, agrega 30 días
     * y la convierte al formato YYYY-MM-DD.
     *
     * @returns Fecha máxima permitida para
     * realizar una reserva médica.
     */
    private calcularFechaMaxima(): string {

        const fecha = new Date();

        fecha.setDate(fecha.getDate() + 30);

        return this.formatearFecha(fecha);
    }

}
