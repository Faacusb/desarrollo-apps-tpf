//Para el listado completo con posibles filtros (por rango de fechas, por médico o por estado).
//para el admin solamente? - opcionales
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsNotEmpty, IsInt, IsPositive, IsDateString } from "class-validator";
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";

export class FiltrarReservasDto{
    
    @ApiPropertyOptional({
        description: 'Filtrar turnos por estado',
        enum: EstadosReservaEnum,
        example: EstadosReservaEnum.CANCELADO
    })
    @IsOptional()
    @IsEnum(EstadosReservaEnum)
    estado?: EstadosReservaEnum //ver únicamente las reservas que estén en un estado específico

    @ApiPropertyOptional({description: 'Filtrar turnos por médico'})
    @IsOptional()
    @IsNotEmpty()
    @IsInt()
    @IsPositive()
    idMedico?: number;


    @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    desde?: string;

    @ApiPropertyOptional({ example: '2026-12-01T00:00:00.000Z' })
    @IsOptional()
    @IsDateString()
    hasta?: string;
}