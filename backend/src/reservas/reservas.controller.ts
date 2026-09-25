import { Body, Controller, Post, Get, Param, Patch, Put, Query, ParseIntPipe } from "@nestjs/common";
import { ApiBearerAuth } from "@nestjs/swagger";
import { ListReservaDTO } from "./dto/output/List-Reserva.dto.js";
import { ReservasService } from "./reservas.service.js";
import { CambiarEstadoReservaDto } from "./dto/cambiar-estado.dto.js";
import { ListReservaDto } from "./dto/list-reserva.dto.js";
import { FiltrarReservasDto } from "./dto/filtrar-reservas.dto.js";
import { CrearReservaAdminDto } from "./dto/crear-reserva-admin.dto.js";
 
@Controller('reservas')
 export class ReservasController {

    constructor(private readonly reservasService: ReservasService) { }


    @Get("paciente/:id")
    async obtenerReserva(
        @Param("id") id: number
    ): Promise<ListReservaDTO[]> {

        return await this.reservasService.obtenerReservaPacientes(id);
    }


    @Patch(":id")
    async cancelarReservapacinte(
        @Param('id') id: number,
        @Body() dto: CambiarEstadoDto,
    ): Promise<void> {

        return await this.reservasService.CancelarReservaPaciente(id, dto);
    }



    //endpoint admin crear reserva
    //@Roles('ADMINISTRADOR')
    //@UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Post()
    async crearReservaAdmin(@Body() dto: CrearReservaAdminDto): Promise<{ id: number }> {
        return await this.reservasService.crearReservaAdmin(dto);
    }

    //endpoint admin obtener reserva
    //@Roles('ADMINISTRADOR')
    //@UseGuards(AuthGuard)
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
