import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Reserva} from "./entities/reserva.entity.js"
 import { ListReservaDTO } from "../dto/output/List-Reserva.dto";
import { Repository } from "typeorm";
import { estadosreservaEnum } from "../common/enums/estados-reserva.enum.js";

@Injectable()
export class ReservaService {

    constructor(@InjectRepository(Reserva) private readonly repository: Repository<Reserva>) { }

async obtenerReservaPacientes(idPacientes: number): Promise<ListReservaDTO[]> {

        const reservas: Reserva[] = await this.repository.find({   where: { idPaciente: idPacientes }, order: { id: "ASC" },});

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


  async CancelarReservaPaciente(idPacientes: number): Promise<void> {
    const reservas: Reserva[] | null = await this.repository.find({ where: { idPaciente: idPacientes }, order: { id: 'ASC' } });
    const reserva = reservas[0];

    if (reserva.estado === estadosreservaEnum.ACTIVO) {
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

    
    reserva.estado = estadosreservaEnum.CANCELAR;
    await this.repository.save(reserva);
  }
}




