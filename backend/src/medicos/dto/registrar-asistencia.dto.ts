
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";

export class RegistrarAsistenciaDto {

    @ApiProperty({
        description: "Estado de asistencia del paciente",
        enum: [
            EstadosReservaEnum.ATENDIDO,
            EstadosReservaEnum.AUSENTE
        ],
        example: EstadosReservaEnum.ATENDIDO
    })
    @IsEnum(
        [EstadosReservaEnum.ATENDIDO, EstadosReservaEnum.AUSENTE],
        {
            message: "El estado debe ser ATENDIDO o AUSENTE"
        }
    )
    estado!: EstadosReservaEnum;
}