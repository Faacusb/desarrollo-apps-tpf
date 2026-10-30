//helpers de errores/fechas
import { HttpErrorResponse } from "@angular/common/http";
import { ReservaAdmin } from "./admin.models";

export function mensajeDeError(error: HttpErrorResponse): string {
    const mensaje = error.error?.message;
    const detalle = Array.isArray(mensaje) ? mensaje.join(' ') : mensaje;

    switch(error.status) {
        case 0:
            return 'No se pudo conectar con el servidor';
        case 400:
            return detalle || 'Los datos enviados no son válidos';
        case 401:
            return 'Tu sesión no es válida o expiró. Volvé a iniciar sesión';
        case 403:
            return 'No tenés permisos de administrador';
        case 404: 
            return detalle || 'No se encontró el recurso';
        case 409:
            return detalle || 'Ya existe una reserva en ese horario';
        default:
            return detalle || 'Ocurrió un error inesperado';
    }
}

export function esReservaCancelable(reserva: ReservaAdmin): boolean {
    if (reserva.estado !== 'ACTIVO') {
        return false;
    }

    const fecha = new Date(reserva.fechaHora);
    if (Number.isNaN(fecha.getTime())) {
        return false;
    }

    return new Date() < fecha;
}