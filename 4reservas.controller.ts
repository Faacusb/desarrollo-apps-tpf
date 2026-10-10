import {
  BadRequestException,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ReservasService } from './reservas.service';
import { CreateReservaDto } from './create-reserva.dto';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Post()
  crear(@Body() datos: CreateReservaDto) {
    return this.reservasService.create(datos);
  }

  @Get('horarios-disponibles')
  verHorarios(
    @Query('fecha') fecha: string,
    @Query('medicoId', ParseIntPipe) medicoId: number,
  ) {
    if (!fecha?.trim()) {
      throw new BadRequestException('El parámetro "fecha" es obligatorio.');
    }

    return this.reservasService.obtenerHorarios(fecha, medicoId);
  }

  @Get()
  listar() {
    return this.reservasService.listarTodo();
  }
}