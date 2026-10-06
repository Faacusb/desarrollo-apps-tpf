
import { ApiProperty,} from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";

export class CambiarEstadoDto {

    @ApiProperty({ enum: EstadosReservaEnum, example: EstadosReservaEnum.CANCELADO})
    @IsEnum(EstadosReservaEnum)
  @IsNotEmpty ()
    estado!: EstadosReservaEnum;

}
