//todas las llamadas HTTP
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { CrearReservaAdmin, MedicoAdmin, PacienteOpcion, HorariosDisponibles, ReservaAdmin, ReservaFiltros, RespuestaId } from "./admin.models";

@Injectable({
    providedIn: 'root'
})
export class AdminApiService {
    private readonly baseUrl = '/api/v1'
    constructor(private readonly http: HttpClient) { }

    //metodos publicos
    listarReservas(filtros: ReservaFiltros): Observable<ReservaAdmin[]> {
        return this.http.get<ReservaAdmin[]>(`${this.baseUrl}/reservas`, {
            headers: this.construirHeaders(),
            params: this.construirParams(filtros),
        });
    }

    cancelarReserva(id: number): Observable<void> {
        return this.http.put<void>(`${this.baseUrl}/reservas/${id}`, null, {
            headers: this.construirHeaders(),
        });
    }
    listarMedicos(): Observable<MedicoAdmin[]> {
        return this.http.get<MedicoAdmin[]>(`${this.baseUrl}/medicos`, {
            headers: this.construirHeaders(),
        });
    }
    actualizarTarifa(id: number, valorConsulta: number): Observable<void>{
        return this.http.put<void>(
            `${this.baseUrl}/medicos/${id}`,
            { valorConsulta },
            { headers: this.construirHeaders() },
        );
    }
    listarPacientes(): Observable<PacienteOpcion[]>{
        return this.http.get<PacienteOpcion[]>(`${this.baseUrl}/usuarios/pacientes`, {
            headers: this.construirHeaders(),
        });
    }

    obtenerHorarios(fecha: string, idMedico: number): Observable<HorariosDisponibles> {
        const params = new HttpParams()
            .set('fecha', fecha)
            .set('medicoId', idMedico.toString());

        return this.http.get<HorariosDisponibles>(
            `${this.baseUrl}/reservas/horarios-disponibles`,
            { headers: this.construirHeaders(), params },
        );
    }
    crearReserva(datos: CrearReservaAdmin): Observable<RespuestaId> {
        return this.http.post<RespuestaId>(
            `${this.baseUrl}/reservas/admin`,
            datos,
            { headers: this.construirHeaders() },
        );
    }

    //metodos privados
    private construirHeaders(): HttpHeaders {
        const token = sessionStorage.getItem('accessToken');

        if(!token) {
            return new HttpHeaders();
        }

        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
        });
    }
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