import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateReservaDto {
  @IsDateString()
  @IsNotEmpty()
  fecha: string;

  @IsString()
  @IsNotEmpty()
  hora: string;

  @IsInt()
  @IsNotEmpty()
  idMedico: number;

  @IsInt()
  @IsNotEmpty()
  idPaciente: number;
}