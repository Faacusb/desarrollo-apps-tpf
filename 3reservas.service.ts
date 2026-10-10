import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReservaDto } from './create-reserva.dto';
import { Reserva } from './reserva.entity';

const HORARIOS_DISPONIBLES = [
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
];

const VALOR_CONSULTA = 5000;
const MAX_DIAS_ANTICIPACION = 30;

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservaRepository: Repository<Reserva>,
  ) {}

  async create(datos: CreateReservaDto): Promise<Reserva> {
    const { fecha, hora, medicoId, pacienteId } = datos;
    const fechaElegida = this.parsearFecha(fecha);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaElegida < hoy) {
      throw new BadRequestException(
        'No se pueden reservar fechas pasadas',
      );
    }

    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + MAX_DIAS_ANTICIPACION);

    if (fechaElegida > limite) {
      throw new BadRequestException(
        `Solo se permiten reservas con hasta ${MAX_DIAS_ANTICIPACION} días de anticipación`,
      );
    }

    if (!HORARIOS_DISPONIBLES.includes(hora)) {
      throw new BadRequestException(
        'El horario debe estar entre las 08:00 y las 15:00, en intervalos de una hora',
      );
    }

    const ocupadoMedico = await this.reservaRepository.findOne({
      where: { fecha, hora, medicoId },
    });

    if (ocupadoMedico) {
      throw new ConflictException('Horario ocupado por el médico');
    }

    const ocupadoPaciente = await this.reservaRepository.findOne({
      where: { fecha, hora, pacienteId },
    });

    if (ocupadoPaciente) {
      throw new ConflictException('Ya tienes una reserva en este horario');
    }

    return this.reservaRepository.save({
      ...datos,
      valorConsulta: VALOR_CONSULTA,
    });
  }

  async obtenerHorarios(
    fecha: string,
    medicoId: number,
  ): Promise<{ fecha: string; medicoId: number; disponibles: string[] }> {
    const reservas = await this.reservaRepository.find({
      where: { fecha, medicoId },
      select: { hora: true },
    });

    const ocupadas = new Set(reservas.map(({ hora }) => hora));

    return {
      fecha,
      medicoId,
      disponibles: HORARIOS_DISPONIBLES.filter((hora) => !ocupadas.has(hora)),
    };
  }

  async listarTodo(): Promise<Reserva[]> {
    return this.reservaRepository.find({
      order: { fecha: 'ASC', hora: 'ASC' },
    });
  }

  private parsearFecha(fecha: string): Date {
    const fechaElegida = new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaElegida.getTime())) {
      throw new BadRequestException('La fecha proporcionada no es válida');
    }

    return fechaElegida;
  }
}