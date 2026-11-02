import { HttpErrorResponse } from "@angular/common/http";
import { ReservaAdmin } from "./admin.models";

/**
 * Obtiene un mensaje de error comprensible para el usuario
 * a partir de una respuesta HTTP del backend.
 *
 * Interpreta los principales códigos de error utilizados
 * por la API NestJS:
 *
 * - 0: error de conexión con el servidor.
 * - 400: datos enviados incorrectos.
 * - 401: sesión inválida o expirada.
 * - 403: permisos insuficientes.
 * - 404: recurso no encontrado.
 * - 409: conflicto de reserva.
 *
 * Si el backend proporciona un mensaje de error,
 * lo utiliza cuando corresponde.
 *
 * Cuando el mensaje recibido es un arreglo,
 * une sus elementos en una sola cadena.
 *
 * @param error Respuesta de error HTTP recibida desde la API.
 * @returns Mensaje descriptivo para mostrar en la interfaz.
 */
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

/**
 * Determina si una reserva puede ser cancelada.
 *
 * Para que una reserva sea cancelable debe cumplir
 * las siguientes condiciones:
 *
 * - Su estado debe ser ACTIVO.
 * - La fecha y hora de la reserva deben ser válidas.
 * - La reserva debe tener una fecha y hora futura.
 *
 * Esta función se utiliza como comprobación
 * en la interfaz administrativa.
 *
 * @param reserva Reserva administrativa que se desea evaluar.
 * @returns true si la reserva está activa y su fecha es futura;
 * false en caso contrario.
 */
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
