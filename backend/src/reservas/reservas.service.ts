import { BadRequestException, Inject, Injectable, forwardRef, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reserva } from "./entities/reserva.entity.js";
import { Medico } from "../medicos/entities/medico.entity.js";
import { Usuario } from "../usuarios/entities/usuario.entity.js" //todavía no está implementado
import { ListReservaDTO } from "../dto/output/List-Reserva.dto";
import { ListReservaDto } from "./dto/list-reserva.dto.js";
import { FindOptionsWhere, Repository, MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";
import { EstadosReservaEnum } from "../common/enums/estados-reserva.enum.js";
import { FiltrarReservasDto } from "./dto/filtrar-reservas.dto.js";
import { ListMedicoDto, ListPacienteDto } from "./dto/list-reserva-aux.dto.js";
import { CrearReservaAdminDto } from "./dto/crear-reserva-admin.dto.js";



@Injectable()
export class ReservasService {
    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
        @InjectRepository(Medico) private readonly repositoryMedico: Repository<Medico>,
        @InjectRepository(Usuario) private readonly repositoryUsuario: Repository<Usuario>) { }

    async obtenerReservaPacientes(idPaciente: number): Promise<ListReservaDTO[]> {

        const Reserva: Reserva[] = await this.repository.find({ idPaciente ,Reserva, order: { id: 'ASC' } });

       const dtoList: ListReservaDTO[] = [];

    for (const p of reservas) {
      const dto = new ListReservaDTO();
      dto.id = p.id;
      dto.nombre = p.nombre;
      dto.fecha_hora = p.fecha_hora;
      dto.correoElectronico = p.correoElectronico;
      dto.estado = p.estado;
      dtoList.push(dto);
    }

    return dtoList;
  }


    async CancelarReservaPaciente(idPaciente: number): Promise<void> {
        const reservas: Reserva |null= await this.repository.find({ where: { id: idPaciente } });
        const reserva = reservas[0];
  
if (reserva.estado === EstadosReservaEnum.ACTIVO) {
      throw new BadRequestException("La Reserva NO esta activa");
    }

 const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha_hora);
    const diaAnterior = new Date(fechaReserva);
    diaAnterior.setDate(diaAnterior.getDate() - 1);

    if (ahora > diaAnterior) {
      throw new BadRequestException(
        "El paciente solo puede cancelar la reserva hasta el dia anterior",
      );
    }

    
    reserva.estado = EstadosReservaEnum.CANCELADO;
    await this.repository.save(reserva);
    }


    //metodo para que el admin haga la reserva
    async crearReservaAdmin(dto: CrearReservaAdminDto): Promise < { id: number } > {

        //verificar que el medico y paciente existen 
        const paciente: Usuario | null = await this.repositoryUsuario.findOneBy({ id: dto.idPaciente });
        if (!paciente) {
            throw new NotFoundException("El paciente no existe");
        }

        const medico: Medico | null = await this.repositoryMedico.findOneBy({ id: dto.idMedico });
        if (!medico) {
            throw new NotFoundException("El medico no existe");
        }

        //verifico que el medico no tenga reservas activas en esa hora
        const fecha = new Date(dto.fechaHora);
        const estaOcupado: Reserva | null = await this.repository.findOne({
            where: {
                medico: {id: dto.idMedico },
                fechaHora: fecha,
                estado: EstadosReservaEnum.ACTIVO
            },
        });
        if (estaOcupado) {
            throw new BadRequestException("El medico tiene un turno asignado en este horario.");
        }

        const reserva = this.repository.create(); //recien ahora creo la reserva, luego de verificar
        reserva.medico = medico;       // Le asignás la entidad Medico completa
        reserva.paciente = paciente;   // Le asignás la entidad Usuario completa
        reserva.fechaHora = fecha;
        reserva.estado = EstadosReservaEnum.ACTIVO;

        await this.repository.save(reserva);
        return { id: reserva.id };
    }
    

    //metodo para que el admin obtenga las reservas
    async obtenerTodasLasReservas(filtros: FiltrarReservasDto): Promise<ListReservaDto[]> {
        
        const whereFiltro: FindOptionsWhere<Reserva> = {}
        if (filtros.estado) {
            whereFiltro.estado = filtros.estado;
        }

        if (filtros.idMedico) {
            whereFiltro.medico = { id: filtros.idMedico };
        }

        if (filtros.desde && filtros.hasta) {
            const fechaIn = new Date(filtros.desde)
            const fechaEnd = new Date(filtros.hasta)
            whereFiltro.fechaHora = Between(fechaIn, fechaEnd)
        } else if (filtros.desde){
            const fechaInicio = MoreThanOrEqual(new Date(filtros.desde))
            whereFiltro.fechaHora = fechaInicio;
        } else if (filtros.hasta) {
            const fechaFin = LessThanOrEqual(new Date(filtros.hasta))
            whereFiltro.fechaHora = fechaFin;
        }


        const reservas: Reserva[] = await this.repository.find({ relations: {paciente: true, medico: true}, order: { id: 'ASC' }, where: whereFiltro });

        const dtoListAdmin: ListReservaDTO[] = [];

        for(const r of reservas) {
            const dto = new ListReservaDto();
            dto.id = r.id;
            dto.fechaHora = r.fechaHora;
            dto.estado = r.estado;

            if(r.paciente) {
                dto.paciente = new ListPacienteDto();
                dto.paciente.id = r.paciente.id;
                dto.paciente.nombres = r.paciente.nombres;
                dto.paciente.apellidos = r.paciente.apellidos;
                dto.paciente.correoElectronico = r.paciente.correoElectronico;
            }
            
            if(r.medico) {
                dto.medico = new ListMedicoDto();
                dto.medico.id = r.medico.id;
                dto.medico.matricula = r.medico.matricula;
                dto.medico.valorConsulta = r.medico.valorConsulta;
            }
            
            dtoListAdmin.push(dto);
        }

        return dtoListAdmin;

    }

    //metodo para que el admin pueda cancelar
    async cancelarReservaAdmin(id: number): Promise<void> {
        const reserva: Reserva | null = await this.repository.findOneBy( { id } );
        
        if (!reserva) {
            throw new NotFoundException("Reserva no encontrada");
        }

        const ahora: Date = new Date();
        if (ahora >= reserva.fechaHora) {
            throw new BadRequestException("No se puede cancelar un turno ya iniciado o finalizado");
        }
        
        reserva.estado = EstadosReservaEnum.CANCELADO;
        await this.repository.save(reserva!);
    }
}




