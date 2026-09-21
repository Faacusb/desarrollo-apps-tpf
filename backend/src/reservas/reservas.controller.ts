import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { ListReservaDTO } from "./dto/output/List-Reserva.dto.js";
import { ReservaService } from "../../../service/reserva.service.js";
import { CambiarEstadoReservaDto } from "./dto/cambiar-estado.dto.js";
 
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
        @Body() dto: CambiarEstadoReservaDto,
    ): Promise<void> {

        return await this.reservaService.CancelarReservaPaciente(id, dto);
    }
 }