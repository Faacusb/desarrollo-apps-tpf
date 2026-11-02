import { Component, OnInit, signal, ChangeDetectorRef } from "@angular/core";
import { MedicoAdmin } from "../admin.models";
import { CommonModule, DatePipe } from "@angular/common";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";
import { AdminApiService } from "../admin-api.services";
import { FormsModule } from "@angular/forms";

/**
 * Componente de administración de médicos.
 *
 * Permite consultar el listado de médicos registrados
 * en el sistema y actualizar el valor de sus consultas.
 *
 * Obtiene la información desde el backend NestJS
 * mediante AdminApiService.
 *
 * Utiliza una tabla de PrimeNG para mostrar los médicos
 * y un diálogo para modificar sus tarifas.
 *
 * Gestiona los estados de carga, validaciones,
 * mensajes de error y confirmaciones de actualización.
 */
@Component({
    selector: 'app-admin-medicos-lista',
    standalone: true,
    imports: [CommonModule, TableModule,ButtonModule, DialogModule, FormsModule],
    templateUrl: './medicos-lista.html',
    styleUrl: './medicos-lista.css'
})
export class MedicosLista implements OnInit {

    /**
     * Inicializa el componente con los servicios necesarios.
     *
     * @param apiService Servicio encargado de realizar
     * las operaciones HTTP de administración de médicos.
     * @param cdr Servicio utilizado para actualizar
     * la vista cuando cambian los datos.
     */
    constructor(
        private readonly apiService: AdminApiService,
        private readonly cdr: ChangeDetectorRef
    ) {}

    /**
     * Lista de médicos obtenidos desde el backend.
     *
     * Contiene sus identificadores, matrículas
     * profesionales y valores de consulta.
     */
    medicos: MedicoAdmin[] = [];

    /**
     * Indica si se está consultando el listado de médicos.
     *
     * Permite mostrar un indicador de carga en la interfaz.
     */
    cargando: boolean = false;

    /**
     * Indica si ya finalizó un intento de consulta
     * del listado de médicos.
     *
     * Permite diferenciar el estado inicial de la
     * pantalla de una consulta finalizada.
     */
    consultaRealizada: boolean = false;

    /**
     * Mensaje de error mostrado cuando falla
     * la consulta del listado de médicos.
     */
    mensajeError: string = '';

    /**
     * Mensaje de confirmación mostrado después
     * de actualizar correctamente una tarifa.
     */
    mensajeExito: string = '';

    /**
     * Médico seleccionado para modificar
     * el valor de su consulta.
     *
     * Su valor es null cuando no existe
     * una selección activa.
     */
    medicoSeleccionado: MedicoAdmin | null = null;

    /**
     * Nuevo valor de consulta ingresado en el formulario.
     *
     * Se inicializa con la tarifa actual del médico
     * seleccionado y se valida antes de guardarlo.
     */
    nuevaTarifa: number | null = null;

    /**
     * Indica si se está enviando una actualización
     * del valor de consulta al backend.
     *
     * Evita cerrar el diálogo mientras
     * la operación está en curso.
     */
    guardando: boolean= false;

    /**
     * Mensaje de error asociado a la validación
     * o actualización del valor de consulta.
     */
    errorTarifa: string = '';

    /**
     * Señal de Angular que controla la visibilidad
     * del diálogo de edición de tarifas.
     */
    visible = signal(false);

    /**
     * Método del ciclo de vida de Angular.
     *
     * Consulta el listado de médicos al
     * inicializar el componente.
     */
    ngOnInit(): void {
        this.cargarMedicos();
    }

    /**
     * Obtiene el listado de médicos registrados.
     *
     * Realiza una petición al backend mediante
     * AdminApiService.listarMedicos().
     *
     * Actualiza la lista de médicos, el indicador
     * de carga y el estado de la consulta.
     *
     * Si la petición falla, muestra el mensaje
     * de error recibido o uno predeterminado.
     *
     * Utiliza ChangeDetectorRef para actualizar
     * la vista después de recibir la respuesta.
     */
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

    /**
     * Abre el diálogo para editar la tarifa de un médico.
     *
     * Guarda el médico seleccionado, inicializa
     * el campo nuevaTarifa con su valor actual
     * y limpia los errores anteriores.
     *
     * @param medico Médico cuya tarifa se desea modificar.
     */
    abrirEdicion(medico: MedicoAdmin): void {
        this.medicoSeleccionado = medico;
        this.nuevaTarifa = medico.valorConsulta;
        this.errorTarifa = '';
        this.visible.set(true);
    }

    /**
     * Cierra el diálogo de edición de tarifas.
     *
     * Impide cerrar la ventana mientras se está
     * guardando una actualización.
     *
     * Cuando se permite el cierre, limpia
     * la selección y los datos del formulario.
     */
    cerrarEdicion(): void {
        if (this.guardando) {
            return; // Evitar cerrar mientras se está guardando
        }
        this.visible.set(false);
        this.medicoSeleccionado = null;
        this.nuevaTarifa = null;
        this.errorTarifa = '';
    }

    /**
     * Valida el nuevo valor de consulta del médico.
     *
     * Comprueba que la tarifa ingresada:
     * - No sea null.
     * - Sea un número finito.
     * - Sea un número entero.
     * - Sea mayor que cero.
     *
     * Si la validación falla, establece
     * un mensaje descriptivo en errorTarifa.
     *
     * @returns true si la tarifa cumple todas
     * las validaciones; false en caso contrario.
     */
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

    /**
     * Guarda el nuevo valor de consulta del médico.
     *
     * Verifica que exista un médico seleccionado
     * y que la tarifa ingresada sea válida.
     *
     * Envía la actualización al backend mediante
     * AdminApiService.actualizarTarifa().
     *
     * Si la operación es exitosa:
     * - Actualiza el valor en la lista local.
     * - Finaliza el estado de guardado.
     * - Cierra el diálogo.
     * - Muestra un mensaje de confirmación.
     *
     * Si ocurre un error, muestra el mensaje
     * correspondiente sin actualizar la tarifa local.
     */
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

    /**
     * Actualiza localmente la tarifa de un médico.
     *
     * Recorre el listado de médicos y reemplaza
     * el valor de consulta del médico cuyo ID coincide.
     *
     * Esta operación actualiza únicamente los datos
     * mostrados por la interfaz, sin realizar
     * una nueva petición HTTP.
     *
     * @param id Identificador del médico actualizado.
     * @param valor Nuevo valor de consulta del médico.
     */
    actualizarMedicoEnLista(id: number, valor: number): void{

        this.medicos = this.medicos.map((medico) =>
            medico.id === id
        ? { ...medico, valorConsulta: valor } : medico,
        );
    }
}
