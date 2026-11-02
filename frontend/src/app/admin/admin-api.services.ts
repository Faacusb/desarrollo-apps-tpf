/**
 * Servicio de comunicación HTTP con el backend NestJS.
 *
 * Centraliza las operaciones relacionadas con reservas,
 * médicos y pacientes utilizadas por las pantallas de
 * administración y por las funcionalidades de pacientes.
 */

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { CrearReservaAdmin, MedicoAdmin, PacienteOpcion, HorariosDisponibles, ReservaAdmin, ReservaFiltros, RespuestaId } from "./admin.models";
import { CrearReservaPaciente } from "./admin.models";

/**
 * Servicio que centraliza las operaciones HTTP del sistema
 * de reservas médicas.
 *
 * Permite realizar consultas y modificaciones sobre
 * reservas, médicos y pacientes mediante la API REST
 * desarrollada con NestJS.
 *
 * Incluye operaciones administrativas y de pacientes,
 * utilizando el token JWT almacenado en Session Storage
 * para autenticar las peticiones.
 *
 * El servicio está disponible globalmente mediante
 * providedIn: 'root'.
 */
@Injectable({
    providedIn: 'root'
})
export class AdminApiService {

    /**
     * Ruta base de la API REST del backend.
     *
     * Se utiliza para construir las URLs de las
     * diferentes operaciones HTTP.
     */
    private readonly baseUrl = '/api/v1'

    /**
     * Inicializa el servicio con el cliente HTTP de Angular.
     *
     * @param http Cliente utilizado para realizar las
     * peticiones HTTP al backend NestJS.
     */
    constructor(private readonly http: HttpClient) { }

    /**
     * Obtiene las reservas registradas en el sistema.
     *
     * Realiza una petición GET al endpoint /reservas.
     * Permite filtrar por estado, médico y rango de fechas.
     *
     * Los filtros se convierten en parámetros de consulta
     * mediante el método privado construirParams().
     *
     * @param filtros Criterios de búsqueda de reservas.
     * @returns Observable con la lista de reservas que
     * coinciden con los filtros indicados.
     */
    listarReservas(filtros: ReservaFiltros): Observable<ReservaAdmin[]> {
        return this.http.get<ReservaAdmin[]>(`${this.baseUrl}/reservas`, {
            headers: this.construirHeaders(),
            params: this.construirParams(filtros),
        });
    }

    /**
     * Cancela una reserva desde el área administrativa.
     *
     * Envía una petición PUT al endpoint /reservas/{id}.
     * La operación requiere permisos de administrador.
     *
     * @param id Identificador de la reserva que se desea cancelar.
     * @returns Observable que completa cuando la operación
     * de cancelación finaliza correctamente.
     */
    cancelarReserva(id: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/reservas/${id}`, null, {
            headers: this.construirHeaders(),
        });
    }

    /**
     * Obtiene el listado de médicos del sistema.
     *
     * Consulta el endpoint administrativo /medicos/admin.
     *
     * @returns Observable con los datos administrativos
     * de los médicos registrados.
     */
    listarMedicos(): Observable<MedicoAdmin[]> {
        return this.http.get<MedicoAdmin[]>(`${this.baseUrl}/medicos/admin`, {
            headers: this.construirHeaders(),
        });
    }

    /**
     * Actualiza el valor de consulta de un médico.
     *
     * Realiza una petición PUT al endpoint /medicos/{id},
     * enviando el nuevo importe de la consulta.
     *
     * Esta operación corresponde al rol ADMINISTRADOR.
     *
     * @param id Identificador del médico.
     * @param valorConsulta Nuevo importe de la consulta médica.
     * @returns Observable que completa cuando la
     * actualización se realiza correctamente.
     */
    actualizarTarifa(id: number, valorConsulta: number): Observable<void>{
        return this.http.put<void>(
            `${this.baseUrl}/medicos/${id}`,
            { valorConsulta },
            { headers: this.construirHeaders() },
        );
    }

    /**
     * Obtiene los pacientes disponibles para administración.
     *
     * Realiza una petición GET al endpoint /usuarios/pacientes.
     *
     * @returns Observable con el listado de pacientes
     * y sus datos básicos.
     */
    listarPacientes(): Observable<PacienteOpcion[]>{
        return this.http.get<PacienteOpcion[]>(`${this.baseUrl}/usuarios/pacientes`, {
            headers: this.construirHeaders(),
        });
    }

    /**
     * Consulta los horarios disponibles de un médico.
     *
     * Envía una petición GET al endpoint
     * /reservas/horarios-disponibles.
     *
     * Utiliza la fecha y el identificador del médico
     * como parámetros de consulta.
     *
     * @param fecha Fecha de consulta en formato YYYY-MM-DD.
     * @param idMedico Identificador del médico seleccionado.
     * @returns Observable con la fecha consultada,
     * el identificador del médico y los horarios disponibles.
     */
    obtenerHorarios(fecha: string, idMedico: number): Observable<HorariosDisponibles> {
        const params = new HttpParams()
            .set('fecha', fecha)
            .set('medicoId', idMedico.toString());

        return this.http.get<HorariosDisponibles>(
            `${this.baseUrl}/reservas/horarios-disponibles`,
            { headers: this.construirHeaders(), params },
        );
    }

    /**
     * Crea una reserva desde el área administrativa.
     *
     * Envía los datos de la reserva al endpoint
     * POST /reservas/admin.
     *
     * La petición incluye fecha, horario, identificador
     * del médico e identificador del paciente.
     *
     * @param datos Información necesaria para crear la reserva.
     * @returns Observable con la respuesta HTTP del backend.
     */
    crearReserva(datos: CrearReservaAdmin): Observable<unknown> {
        return this.http.post<unknown>(
            `${this.baseUrl}/reservas/admin`,
            datos,
            { headers: this.construirHeaders() }
        );
    }

    /**
     * Crea una reserva desde el área del paciente.
     *
     * Envía una petición POST al endpoint /reservas
     * utilizando los datos de la reserva.
     *
     * @param datos Fecha, horario, médico y paciente
     * correspondientes a la nueva reserva.
     * @returns Observable con un objeto que contiene
     * el identificador de la reserva creada.
     */
    crearReservaPaciente(
        datos: CrearReservaAdmin
    ): Observable<{ id: number }> {

        return this.http.post<{ id: number }>(
            `${this.baseUrl}/reservas`,
            datos,
            { headers: this.construirHeaders() }
        );
    }

    /**
     * Obtiene las reservas asociadas a un paciente.
     *
     * Consulta el endpoint GET /reservas/paciente/{idPaciente}
     * y permite visualizar sus turnos registrados.
     *
     * @param idPaciente Identificador del paciente.
     * @returns Observable con el listado de reservas
     * correspondiente al paciente indicado.
     */
    listarReservasPaciente(idPaciente: number): Observable<ReservaAdmin[]> {
        return this.http.get<ReservaAdmin[]>(
            `${this.baseUrl}/reservas/paciente/${idPaciente}`,
            { headers: this.construirHeaders() }
        );
    }

    /**
     * Cancela una reserva desde el área del paciente.
     *
     * Realiza una petición PATCH al endpoint /reservas/{id}.
     *
     * El backend es responsable de validar las condiciones
     * necesarias para permitir la cancelación.
     *
     * @param id Identificador de la reserva que se desea cancelar.
     * @returns Observable que completa cuando la
     * cancelación se realiza correctamente.
     */
    cancelarReservaPaciente(id: number): Observable<void> {
        return this.http.patch<void>(
            `${this.baseUrl}/reservas/${id}`,
            null,
            { headers: this.construirHeaders() }
        );
    }

    /**
     * Construye los encabezados HTTP de autenticación.
     *
     * Obtiene el token JWT almacenado en Session Storage
     * y lo incorpora al encabezado Authorization
     * utilizando el esquema Bearer.
     *
     * Si no existe un token almacenado, devuelve
     * un objeto HttpHeaders sin encabezados adicionales.
     *
     * @returns Encabezados HTTP para realizar las peticiones
     * a la API REST.
     */
    private construirHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('accessToken');

        if(!token) {
            return new HttpHeaders();
        }

        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }

    /**
     * Construye los parámetros HTTP para filtrar reservas.
     *
     * Agrega únicamente los filtros que contienen valores:
     * estado, médico, fecha inicial y fecha final.
     *
     * Para los filtros de fechas, utiliza el inicio
     * y el final del día con el desplazamiento horario
     * -03:00, correspondiente a Argentina.
     *
     * @param filtros Criterios opcionales de búsqueda.
     * @returns Objeto HttpParams con los parámetros
     * de consulta que se enviarán al backend.
     */
    private construirParams(filtros: ReservaFiltros): HttpParams {
        let params = new HttpParams();

        if(filtros.estado){
            params = params.set('estado', filtros.estado);
        }
        if(filtros.idMedico){
            params = params.set('idMedico', filtros.idMedico.toString());
        }
        if(filtros.desde){
            params = params.set('desde', `${filtros.desde}T00:00:00-03:00`);
        }
        if(filtros.hasta){
            params = params.set('hasta', `${filtros.hasta}T23:59:59-03:00`);
        }

        return params;
    }
}
