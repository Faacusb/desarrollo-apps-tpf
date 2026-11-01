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
import { MedicoAdminDto } from "./dto/medico-admin.dto.js";

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
        fecha?: string
    ): Promise<Reserva[]> {

        // Verificar que el médico exista
        const medico = await this.repository.findOneBy({ id: idMedico });

        if (!medico) {
            throw new NotFoundException("No existe el médico");
        }

        // Construir consulta de reservas del médico
        const consulta = this.reservasRepository
            .createQueryBuilder("reserva")
            .leftJoin("reserva.paciente", "paciente")
            .addSelect([
                "paciente.id",
                "paciente.documento",
                "paciente.apellidos",
                "paciente.nombres"
            ])
            .where("reserva.medico = :idMedico", { idMedico });

        // Si se recibió una fecha, filtrar solamente ese día
        if (fecha) {

            if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
                throw new BadRequestException(
                    "La fecha debe tener formato YYYY-MM-DD"
                );
            }

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

            const fin = new Date(inicio);
            fin.setDate(fin.getDate() + 1);

            consulta
                .andWhere("reserva.fechaHora >= :inicio", { inicio })
                .andWhere("reserva.fechaHora < :fin", { fin });
        }

        // Orden cronológico: primero los turnos más próximos
        return await consulta
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

    // Obtener todos los medicos para el admin
    async obtenerMedicosAdmin(): Promise<MedicoAdminDto[]> {

        const medicos = await this.repository.find({ order: { id: 'ASC' } })
        
        const dtoList: MedicoAdminDto[] = [];
        for (const m of medicos) {
            const dto = new MedicoAdminDto();
            dto.id = m.id;
            dto.idUsuario = m.idUsuario;
            dto.matricula = m.matricula;
            dto.valorConsulta = m.valorConsulta;
            dtoList.push(dto);
        }

        return dtoList;
    } 
}


