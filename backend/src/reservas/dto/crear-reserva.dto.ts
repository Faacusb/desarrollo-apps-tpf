//para usuario-paciente?
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber,IsDateString   } from "class-validator";

 export class CrearReservaDto {
    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
     idMedico!: number;

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    fechaHora !: string;

}


