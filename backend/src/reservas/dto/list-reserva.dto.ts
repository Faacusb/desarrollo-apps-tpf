//archivo para luego listar reservas ADMIN
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";
import { ListPacienteDto, ListMedicoDto } from "./list-reserva-aux.dto.js";
import { ApiProperty } from "@nestjs/swagger";

export class ListReservaDto {

    @ApiProperty()
    id!: number;

    @ApiProperty({
        example: '2026-10-20T15:30:00.000Z',
        type: String
    })
    fechaHora!: Date;

    @ApiProperty({ enum: EstadosReservaEnum, example: EstadosReservaEnum.ACTIVO})
    estado!: EstadosReservaEnum;

    @ApiProperty({ type: ListPacienteDto })
    paciente!: ListPacienteDto;

    @ApiProperty({ type: ListMedicoDto })
    medico!: ListMedicoDto;
}