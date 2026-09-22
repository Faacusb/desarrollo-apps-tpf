import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ListReservaDTO } from "./dto/output/list-reserva.dto.js";
import { ReservaService } from "./reservas.service.js";
import { CambiarEstadoDto } from "./dto/cambiar-estado.dto.js";
 
@Controller('Reservas')
 export class ReservasController {

    constructor(private readonly reservaService: ReservaService) { }


    @Get("paciente/:id")
    async obtenerReserva(
        @Param("id") id: number
    ): Promise<ListReservaDTO[]> {

        return await this.reservaService.obtenerReservaPacientes(id);
    }


    @Patch(":id")
    async cancelarReservapacinte(
        @Param('id') id: number,
        @Body() dto: CambiarEstadoDto,
    ): Promise<void> {

        // aca creo que estoy llamando mal  el service 


        return await this.reservaService.CancelarReservaPaciente(id, dto);
    }
 }


