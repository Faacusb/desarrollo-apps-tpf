//para usuario-paciente?
import { ApiProperty } from "@nestjs/swagger";

    export class CrearReservaDto {

    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombre!: string;

    @ApiProperty()
    fecha_hora!: Date ;  

    @ApiProperty({ required: false, nullable: true })
    correoElectronico!: string;

    @ApiProperty()
    estado!:  string;

}
