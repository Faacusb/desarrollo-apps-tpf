import { IsNotEmpty, IsPositive, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class ActulizarValorConsulta{

    @ApiProperty({
        description: "Actualizar valores de la consulta",
        example: 40000,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    valorConsulta!: number;
}
