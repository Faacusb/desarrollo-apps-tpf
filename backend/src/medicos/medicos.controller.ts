import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Query
} from "@nestjs/common";

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery
} from "@nestjs/swagger";

import { MedicosService } from "./medicos.service.js";
import { ActulizarValorConsultaDto } from "./dto/actualizar-valor-consulta.dto.js";
import { RegistrarAsistenciaDto } from "./dto/registrar-asistencia.dto.js";

@Controller("medicos")
export class MedicosController {

    constructor(
        private readonly service: MedicosService
    ) {}

    // Endpoint modificar tarifa ADMIN
    //@Roles('ADMINISTRADOR')
    //@UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Put(":id")
    async actualizarValorConsulta(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: ActulizarValorConsultaDto
    ): Promise<void> {

        await this.service.actualizarValorConsulta(id, dto);
    }

    // Endpoint consultar agenda MEDICO
    @Get(":id/agenda")
    @ApiOperation({
        summary: "Consultar la agenda de un médico por fecha"
    })
    @ApiParam({
        name: "id",
        type: Number,
        description: "ID del médico"
    })
    @ApiQuery({
        name: "fecha",
        type: String,
        required: true,
        example: "2026-10-15",
        description: "Fecha de la agenda en formato YYYY-MM-DD"
    })
    async obtenerAgenda(
        @Param("id", ParseIntPipe) id: number,
        @Query("fecha") fecha: string
    ) {
        return await this.service.obtenerAgenda(id, fecha);
    }

    // Endpoint registrar asistencia MEDICO
    @Put(":id/agenda/:idReserva/asistencia")
    @ApiOperation({
        summary: "Registrar asistencia de un paciente"
    })
    @ApiParam({
        name: "id",
        type: Number,
        description: "ID del médico"
    })
    @ApiParam({
        name: "idReserva",
        type: Number,
        description: "ID de la reserva"
    })
    @ApiBody({
        type: RegistrarAsistenciaDto
    })
    async registrarAsistencia(
        @Param("id", ParseIntPipe) idMedico: number,
        @Param("idReserva", ParseIntPipe) idReserva: number,
        @Body() dto: RegistrarAsistenciaDto
    ): Promise<void> {

        await this.service.registrarAsistencia(
            idMedico,
            idReserva,
            dto.estado
        );
    }
}
