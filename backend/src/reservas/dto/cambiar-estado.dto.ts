
import { ApiProperty,} from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { estadosreservaEnum } from "../../common/enums/estados-reserva.enum.js";

export class CambiarEstadoDto {

    @ApiProperty({ enum: estadosreservaEnum, example: estadosreservaEnum.CANCELAR})
    @IsEnum(estadosreservaEnum)
  @IsNotEmpty ()
    estado!: estadosreservaEnum;

}
