import { Body, Controller, Post, Get, Param, Patch, Put, Query, ParseIntPipe, BadRequestException, UseGuards } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ReservasService } from "./reservas.service.js";
//import { CambiarEstadoDto } from "./dto/cambiar-estado.dto.js";
import { ListReservaDto } from "./dto/list-reserva.dto.js";
import { FiltrarReservasDto } from "./dto/filtrar-reservas.dto.js";
import { CrearReservaAdminDto } from "./dto/crear-reserva-admin.dto.js";
import { CreateReservaDto } from "./dto/2create-reserva.dto.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { AuthGuard } from "../auth/guards/auth.guard.js";
import { RolesUsuarioEnum } from "../common/enums/roles.enum.js";

@Controller('reservas')
 export class ReservasController {

    constructor(private readonly reservasService: ReservasService) { }

    // ---- PACIENTE ----
    @Post()
      async crear(@Body() datos: CreateReservaDto) {
        return this.reservasService.create(datos);
      }
    
      @Get('horarios-disponibles')
      async obtenerHorarios(
        @Query('fecha') fecha: string,
        @Query('medicoId', ParseIntPipe) medicoId: number,
      ) {
        if (!fecha?.trim()) {
          throw new BadRequestException('El parámetro "fecha" es obligatorio.');
        }
    
        return this.reservasService.obtenerHorarios(fecha, medicoId);
      }
    
      /*@Get()
      listar() {
        return this.reservasService.listarTodo();
      }*/



    @Get("paciente/:id")
    async obtenerReserva(
        @Param("id", ParseIntPipe) id: number
    ): Promise<ListReservaDto[]> {

        return await this.reservasService.obtenerReservaPacientes(id);
    }


    @Patch(":id")
    async cancelarReservapaciente(
        @Param('id') id: number,
    ): Promise<void> {

        return await this.reservasService.cancelarReservaPaciente(id);
    }


    // ---- ADMIN ----
    //endpoint admin crear reserva
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post()
    async crearReservaAdmin(@Body() dto: CrearReservaAdminDto): Promise<{ id: number }> {
        return await this.reservasService.crearReservaAdmin(dto);
    }

    //endpoint admin obtener reserva
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Get()
    async obtenerTodasLasReservas(@Query() filtros: FiltrarReservasDto): Promise<ListReservaDto[]> {
        return this.reservasService.obtenerTodasLasReservas(filtros);
    }


    //endpoit admin cancelar reserva
    @ApiBearerAuth()
    @Put(":id")
    async cancelarReservaAdmin(@Param("id", ParseIntPipe) id: number): Promise<void> {
    
        await this.reservasService.cancelarReservaAdmin(id);
    }
}
