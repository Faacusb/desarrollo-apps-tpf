import { BadRequestException, Inject, Injectable, forwardRef } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reserva } from "../entity/reserva.entity";
import { ListReservaDTO } from "../dto/output/List-Reserva.dto";
import { Repository } from "typeorm";
import { EstadosReservaEnum } from "../Estados-Reserva.enums";


@Injectable()
export class ReservaService {

    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>,
 @Inject(forwardRef(() => ReservasService)) private readonly ReservasService: ReservasService) { }

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
}




