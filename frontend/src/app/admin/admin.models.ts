/**
 * Estados posibles de una reserva médica.
 *
 * - ACTIVO: reserva vigente.
 * - ATENDIDO: paciente atendido por el médico.
 * - AUSENTE: paciente que no asistió al turno.
 * - CANCELADO: reserva anulada.
 */
export type EstadosReservas =
    | 'ACTIVO'
    | 'ATENDIDO'
    | 'AUSENTE'
    | 'CANCELADO';

/**
 * Representa una reserva recuperada desde la API
 * para su visualización en el área administrativa.
 *
 * Incluye los datos de la reserva, del paciente
 * asociado y del médico correspondiente.
 */
export interface ReservaAdmin {

    /**
     * Identificador único de la reserva.
     */
    id: number;

    /**
     * Fecha y hora de la reserva en formato de cadena.
     */
    fechaHora: string;

    /**
     * Estado actual de la reserva.
     */
    estado: EstadosReservas;

    /**
     * Datos básicos del paciente asociado a la reserva.
     */
    paciente: {
        id: number,
        nombres: string,
        apellidos: string,
        email: string
    };

    /**
     * Datos administrativos del médico asignado.
     */
    medico: {
        id: number,
        matricula: number,
        valorConsulta: number
    };
}

/**
 * Representa los datos de un médico utilizados
 * en las pantallas administrativas.
 */
export interface MedicoAdmin {

    /**
     * Identificador único del médico.
     */
    id: number;

    /**
     * Identificador del usuario asociado al médico.
     */
    idUsuario: number;

    /**
     * Número de matrícula profesional del médico.
     */
    matricula: number;

    /**
     * Importe actual de la consulta médica.
     */
    valorConsulta: number;
}

/**
 * Representa un paciente disponible para seleccionar
 * durante la creación administrativa de reservas.
 */
export interface PacienteOpcion {

    /**
     * Identificador único del paciente.
     */
    id: number;

    /**
     * Nombres del paciente.
     */
    nombres: string;

    /**
     * Apellidos del paciente.
     */
    apellidos: string;

    /**
     * Correo electrónico del paciente.
     */
    email: string;
}

/**
 * Define los filtros opcionales utilizados para
 * consultar reservas desde el área administrativa.
 *
 * Permite buscar por estado, médico y un
 * intervalo de fechas.
 */
export interface ReservaFiltros {

    /**
     * Estado de reserva utilizado como filtro.
     *
     * Si es null o no se define, no se aplica
     * un filtro por estado.
     */
    estado?: EstadosReservas | null;

    /**
     * Identificador del médico utilizado como filtro.
     *
     * Si es null o no se define, se incluyen
     * las reservas de todos los médicos.
     */
    idMedico?: number | null;

    /**
     * Fecha inicial del intervalo de búsqueda.
     */
    desde?: string | null;

    /**
     * Fecha final del intervalo de búsqueda.
     */
    hasta?: string | null;
}

/**
 * Define los datos necesarios para crear una reserva
 * desde el área de administración.
 *
 * Se utiliza como contrato de entrada para
 * la petición correspondiente a la API NestJS.
 */
export interface CrearReservaAdmin {

    /**
     * Fecha de la reserva en formato YYYY-MM-DD.
     */
    fecha: string;

    /**
     * Horario seleccionado en formato HH:mm.
     */
    hora: string;

    /**
     * Identificador del médico de la reserva.
     */
    idMedico: number;

    /**
     * Identificador del paciente de la reserva.
     */
    idPaciente: number;
}

/**
 * Representa la respuesta de la API al consultar
 * los horarios disponibles de un médico.
 */
export interface HorariosDisponibles {

    /**
     * Fecha consultada en formato YYYY-MM-DD.
     */
    fecha: string;

    /**
     * Identificador del médico consultado.
     */
    idMedico: number;

    /**
     * Lista de horarios disponibles para reservar.
     */
    disponibles: string[];
}

/**
 * Representa una respuesta que contiene
 * el identificador de un recurso.
 *
 * Se utiliza, por ejemplo, después de crear
 * una reserva desde el área administrativa.
 */
export interface RespuestaId {

    /**
     * Identificador único del recurso.
     */
    id: number;
}

/**
 * Representa una opción del selector de estados
 * utilizado para filtrar reservas.
 */
export interface OpcionEstado {

    /**
     * Etiqueta visible de la opción.
     */
    label: string;

    /**
     * Estado asociado a la opción.
     *
     * El valor null representa la selección
     * de todos los estados.
     */
    value: EstadosReservas | null;
}

/**
 * Opciones disponibles para el filtro de estado
 * del monitor administrativo de reservas.
 *
 * Incluye una opción general para mostrar todas
 * las reservas y una opción por cada estado posible.
 */
export const ESTADOS_RESERVAS: OpcionEstado[] = [
    { label: 'Todos', value: null},
    { label: 'Activo', value: 'ACTIVO'},
    { label: 'Atendido', value: 'ATENDIDO'},
    { label: 'Ausente', value: 'AUSENTE'},
    { label: 'Cancelado', value: 'CANCELADO'},
];

/**
 * Define los datos necesarios para crear una reserva
 * desde el área del paciente.
 *
 * Contiene la fecha, el horario y los identificadores
 * del médico y del paciente asociados.
 */
export interface CrearReservaPaciente {

    /**
     * Fecha seleccionada en formato YYYY-MM-DD.
     */
    fecha: string;

    /**
     * Horario seleccionado en formato HH:mm.
     */
    hora: string;

    /**
     * Identificador del médico seleccionado.
     */
    idMedico: number;

    /**
     * Identificador del paciente asociado.
     */
    idPaciente: number;
}
