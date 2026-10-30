import { EstadosReservaEnum } from "../common/enums/estados-reserva.enum.js";
import { InjectRepository } from "@nestjs/typeorm";
import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { Medico } from "./entities/medico.entity.js";
import { Reserva } from "../reservas/entities/reserva.entity.js";
import { Repository } from "typeorm";
import { ActulizarValorConsultaDto } from "./dto/actualizar-valor-consulta.dto.js";

@Injectable()
export class MedicosService {

    constructor(
        @InjectRepository(Medico)
        private readonly repository: Repository<Medico>,

        @InjectRepository(Reserva)
        private readonly reservasRepository: Repository<Reserva>
    ) {}

    // Método actualizar valor consulta ADMIN
    async actualizarValorConsulta(
        id: number,
        dto: ActulizarValorConsultaDto
    ): Promise<void> {

        const medico: Medico | null = await this.repository.findOneBy({ id });

        if (!medico) {
            throw new NotFoundException("No existe el médico");
        }

        this.repository.merge(medico, dto);
        await this.repository.save(medico);
    }

    // Obtener el médico asociado al usuario autenticado
    async obtenerMedicoPorUsuario(idUsuario: number): Promise<Medico> {

        const medico = await this.repository.findOneBy({
            idUsuario: idUsuario
        });

        if (!medico) {
            throw new NotFoundException(
                "No existe un médico asociado al usuario autenticado"
            );
        }

        return medico;
    }

    // Método obtener agenda MEDICO
    async obtenerAgenda(
        idMedico: number,
        fecha: string
    ): Promise<Reserva[]> {

        // Verificar que el médico exista
        const medico = await this.repository.findOneBy({ id: idMedico });

        if (!medico) {
            throw new NotFoundException("No existe el médico");
        }

        // Validar el formato de la fecha
        if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            throw new BadRequestException(
                "La fecha debe tener formato YYYY-MM-DD"
            );
        }

        // Calcular el inicio del día
        const inicio = new Date(`${fecha}T00:00:00`);

        if (
            Number.isNaN(inicio.getTime()) ||
            inicio.getFullYear() !== Number(fecha.slice(0, 4)) ||
            inicio.getMonth() + 1 !== Number(fecha.slice(5, 7)) ||
            inicio.getDate() !== Number(fecha.slice(8, 10))
        ) {
            throw new BadRequestException(
                "La fecha ingresada no es válida"
            );
        }

        // Calcular el inicio del día siguiente
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + 1);

        // Obtener las reservas del médico con datos limitados del paciente
        return await this.reservasRepository
            .createQueryBuilder("reserva")
            .leftJoin("reserva.paciente", "paciente")
            .addSelect([
                "paciente.id",
                "paciente.documento",
                "paciente.apellidos",
                "paciente.nombres"
            ])
            .where("reserva.medico = :idMedico", { idMedico })
            .andWhere("reserva.fechaHora >= :inicio", { inicio })
            .andWhere("reserva.fechaHora < :fin", { fin })
            .orderBy("reserva.fechaHora", "ASC")
            .getMany();
    }

    // Método registrar asistencia MEDICO
    async registrarAsistencia(
        idMedico: number,
        idReserva: number,
        estado: EstadosReservaEnum
    ): Promise<void> {

        // Solo se permite registrar ATENDIDO o AUSENTE
        if (
            estado !== EstadosReservaEnum.ATENDIDO &&
            estado !== EstadosReservaEnum.AUSENTE
        ) {
            throw new BadRequestException(
                "El estado debe ser ATENDIDO o AUSENTE"
            );
        }

        // Buscar la reserva y verificar a qué médico pertenece
        const reserva = await this.reservasRepository.findOne({
            where: { id: idReserva },
            relations: { medico: true }
        });

        if (!reserva || reserva.medico.id !== idMedico) {
            throw new NotFoundException(
                "No existe la reserva para este médico"
            );
        }

        // Solo se pueden registrar reservas activas
        if (reserva.estado !== EstadosReservaEnum.ACTIVO) {
            throw new BadRequestException(
                "Solo se puede registrar asistencia en reservas activas"
            );
        }

        // Actualizar el estado
        reserva.estado = estado;
        await this.reservasRepository.save(reserva);
    }
}


