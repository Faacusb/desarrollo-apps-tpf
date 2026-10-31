import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Correo electrónico del usuario',
    example: 'usuario@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'ContraseniaDeEjemplo',
    writeOnly: true,
  })
  @IsString()
  @MinLength(1)
  clave!: string;
}