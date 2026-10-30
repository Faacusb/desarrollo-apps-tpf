import { ApiProperty } from "@nestjs/swagger";

export class MedicoAdminDto {

    @ApiProperty()
    id!: number;

    @ApiProperty({})
    idUsuario!: number;

    @ApiProperty({})
    matricula!: number;

    @ApiProperty({})
    valorConsulta!: number;
}