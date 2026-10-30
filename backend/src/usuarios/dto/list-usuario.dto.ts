import { ApiProperty } from "@nestjs/swagger";

export class ListUsuarioDto{
    
    @ApiProperty()
    id!: number;

    @ApiProperty()
    documento!: string;

    @ApiProperty()
    nombres!: string;

    @ApiProperty()
    apellidos!: string; 

    @ApiProperty()
    email!: string;

}