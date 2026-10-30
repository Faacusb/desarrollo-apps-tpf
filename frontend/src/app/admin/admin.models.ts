// interfaces, tipos y constantes - contrato con el backend

export type EstadosReservas = 
    | 'ACTIVO' 
    | 'ATENDIDO' 
    | 'AUSENTE' 
    | 'CANCELADO';

export interface ReservaAdmin {
  id: number;
  fechaHora: string;
  estado: EstadosReservas;
  paciente: {
    id: number,
    nombres: string,
    apellidos: string,
    email: string
  };
  medico: {
    id: number,
    matricula: number,
    valorConsulta: number
  };
}

export interface MedicoAdmin {
    id: number;
    idUsuario: number;
    matricula: number;
    valorConsulta: number;
}

export interface PacienteOpcion {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
}

export interface ReservaFiltros {
    estado?: EstadosReservas | null;
    idMedico?: number | null;
    desde?: string | null; 
    hasta?: string | null;
}

export interface CrearReservaAdmin {
    fecha: string;
    hora: string;
    idMedico: number;
    idPaciente: number;
}

export interface HorariosDisponibles {
    fecha: string;
    idMedico: number,
    disponibles: string[];
}

export interface RespuestaId {
    id: number;
}

export interface OpcionEstado {
    label: string;
    value: EstadosReservas | null;
}

export const ESTADOS_RESERVAS: OpcionEstado[] = [
    { label: 'Todos', value: null},
    { label: 'Activo', value: 'ACTIVO'},
    { label: 'Atendido', value: 'ATENDIDO'},
    { label: 'Ausente', value: 'AUSENTE'},
    { label: 'Cancelado', value: 'CANCELADO'},
]