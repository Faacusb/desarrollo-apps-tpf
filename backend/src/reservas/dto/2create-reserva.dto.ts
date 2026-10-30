import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsString, IsPositive, Matches } from 'class-validator';

export class CreateReservaDto {
  @ApiProperty({ example: '2026-11-13', description: 'Formato YYYY-MM-DD' })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener formato YYYY-MM-DD',
  })
  @IsNotEmpty()
  fecha: string;

  @ApiProperty({ example: '11:00', description: 'Horario habilitado (08:00 a 15:00)'})
  @IsString()
  @IsNotEmpty()
  hora: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsPositive()
  idMedico: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  idPaciente: number;
}