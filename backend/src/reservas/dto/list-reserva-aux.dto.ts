// archivo aux para mostrar paciente y medico para el ADMIN

import { ApiProperty } from "@nestjs/swagger";

export class ListPacienteDto{
    
    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string; 

    @ApiProperty()
    correoElectronico!: string;

}


export class ListMedicoDto{
    
    @ApiProperty()
    id!: number;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string;

    @ApiProperty()
    valorConsulta!: number;

}