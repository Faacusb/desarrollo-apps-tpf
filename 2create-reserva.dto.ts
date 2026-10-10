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
  medicoId: number;

  @IsInt()
  @IsNotEmpty()
  pacienteId: number;
}