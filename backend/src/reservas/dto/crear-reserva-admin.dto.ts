import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsEnum, IsInt, IsPositive, IsDateString } from "class-validator";
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";

export class CrearReservaAdminDto { 

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    id!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    idMedico!: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    idPaciente!: number;

    @ApiProperty({
        example: '2026-12-01T00:00:00.000Z',
        type: Date,
    })
    @IsDateString()
    @IsNotEmpty()
    fechaHora!: string;

    @ApiProperty({ enum: EstadosReservaEnum, example: EstadosReservaEnum.ACTIVO })
    @IsNotEmpty()
    @IsEnum(EstadosReservaEnum)
    estado!: EstadosReservaEnum;
}