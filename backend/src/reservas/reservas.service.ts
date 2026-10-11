import { BadRequestException, Inject, Injectable, forwardRef, NotFoundException, ConflictException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reserva } from "./entities/reserva.entity.js";
import { Medico } from "../medicos/entities/medico.entity.js";
import { Usuario } from "../usuarios/entities/usuario.entity.js" //todavía no está implementado
import { ListReservaDto } from "./dto/list-reserva.dto.js";
import { FindOptionsWhere, Repository, MoreThanOrEqual, LessThanOrEqual, Between } from "typeorm";
import { EstadosReservaEnum } from "../common/enums/estados-reserva.enum.js";
import { FiltrarReservasDto } from "./dto/filtrar-reservas.dto.js";
import { ListMedicoDto, ListPacienteDto } from "./dto/list-reserva-aux.dto.js";
import { CrearReservaAdminDto } from "./dto/crear-reserva-admin.dto.js";

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
    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
        @InjectRepository(Medico) private readonly repositoryMedico: Repository<Medico>,
        @InjectRepository(Usuario) private readonly repositoryUsuario: Repository<Usuario>) { }

    async create(datos: CrearReservaAdminDto): Promise<Reserva> {
        const { fechaHora, idMedico, idPaciente } = datos;
        const fechaElegida = this.parsearFecha(fechaHora);
    
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
    
        const ocupadoMedico = await this.repository.findOne({
          where: { fechaHora, idMedico },
        });
    
        if (ocupadoMedico) {
          throw new ConflictException('Horario ocupado por el médico');
        }
    
        const ocupadoPaciente = await this.repository.findOne({
          where: { fechaHora, idPaciente },
        });
    
        if (ocupadoPaciente) {
          throw new ConflictException('Ya tienes una reserva en este horario');
        }
    
        return this.repository.save({
          ...datos,
          valorConsulta: VALOR_CONSULTA,
        });
      }
    
    async obtenerHorarios(
        fechaHora: string,
        idMedico: number,
      ): Promise<{ fechaHora: string; idMedico: number; disponibles: string[] }> {
        const reservas = await this.repository.find({
          where: { fechaHora, idMedico },
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
        return this.repository.find({
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
    
    
    
    
    async obtenerReservaPacientes(idPaciente: number): Promise<ListReservaDto[]> {

      const reservas: Reserva[] = await this.repository.find({ where: { paciente: true}, order: { id: "ASC" },});
      
      const paciente: Usuario | null = await this.repositoryUsuario.findOneBy({ id: idPaciente });
        if (!paciente) {
            throw new NotFoundException("El paciente no existe");
        }
      const dtoList: ListReservaDto[] = [];

      for (const p of reservas) {
      const dto = new ListReservaDto();
      dto.id = p.id;
      if(p.paciente) {
          dto.paciente = new ListPacienteDto();
          dto.paciente.id = p.paciente.id;
          dto.paciente.nombres = p.paciente.nombres;
          dto.paciente.apellidos = p.paciente.apellidos;
          dto.paciente.email = p.paciente.email;
        }
      dto.estado = p.estado;
      dtoList.push(dto);
    }

    return dtoList;
  }


  async cancelarReservaPaciente(idPaciente: number): Promise<void> {
    const reservas: Reserva[] | null = await this.repository.find({  relations: {paciente: true}, order: { id: 'ASC' } });
    const reserva = reservas[0];
    
    const paciente: Usuario | null = await this.repositoryUsuario.findOneBy({ id: idPaciente });
        if (!paciente) {
            throw new NotFoundException("El paciente no existe");
        }

    if (reserva.estado === EstadosReservaEnum.ACTIVO) {
      throw new BadRequestException("La Reserva NO esta activa");
    }

    const ahora = new Date();
      const fechaReserva = new Date(reserva.fechaHora);
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

        const dtoListAdmin: ListReservaDto[] = [];

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
                dto.paciente.email = r.paciente.email;
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




