import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Put,
    Query,
    Req,
    UseGuards
} from "@nestjs/common";

import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiOkResponse,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse
} from "@nestjs/swagger";

import { MedicosService } from "./medicos.service.js";
import { ActulizarValorConsultaDto } from "./dto/actualizar-valor-consulta.dto.js";
import { RegistrarAsistenciaDto } from "./dto/registrar-asistencia.dto.js";

import { AuthGuard } from "../auth/guards/auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesUsuarioEnum } from "../common/enums/roles.enum.js";

import type { Request } from "express";

type RequestAutenticada = Request & {
    user: {
        id: number;
        email: string;
        rol: RolesUsuarioEnum;
    };
};

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
    @Get("mi-agenda")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.MEDICO)
    @ApiBearerAuth()

    @ApiOperation({
        summary: "Consultar la agenda del médico autenticado por fecha",
        description:
            "Permite a un usuario con rol MEDICO consultar sus " +
            "reservas correspondientes a una fecha determinada. " +
            "El médico se identifica automáticamente mediante " +
            "el token JWT."
    })

    @ApiQuery({
        name: "fecha",
        type: String,
        required: true,
        example: "2026-10-29",
        description: "Fecha de la agenda en formato YYYY-MM-DD"
    })

    // Respuesta exitosa
    @ApiOkResponse({
        description:
            "Agenda del médico obtenida correctamente. " +
            "Devuelve las reservas de la fecha seleccionada, " +
            "ordenadas por horario, junto con los datos " +
            "básicos de cada paciente."
    })

    // Fecha incorrecta
    @ApiBadRequestResponse({
        description:
            "La fecha ingresada no tiene el formato YYYY-MM-DD " +
            "o no corresponde a una fecha válida."
    })

    // Usuario no autenticado
    @ApiUnauthorizedResponse({
        description:
            "No se proporcionó un token JWT válido o la sesión expiró."
    })

    // Usuario sin permisos
    @ApiForbiddenResponse({
        description:
            "El usuario autenticado no tiene el rol MEDICO."
    })

    // Médico inexistente
    @ApiNotFoundResponse({
        description:
            "No existe un médico asociado al usuario autenticado."
    })

    async obtenerAgenda(
        @Req() request: RequestAutenticada,
        @Query("fecha") fecha: string
    ) {

        // Identificar al médico a partir del usuario autenticado
        const medico = await this.service.obtenerMedicoPorUsuario(
            request.user.id
        );

        // Obtener las reservas del médico para la fecha
        return await this.service.obtenerAgenda(
            medico.id,
            fecha
        );
    }
      
    // Endpoint registrar asistencia MEDICO     
    @Put("mi-agenda/:idReserva/asistencia")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.MEDICO)
    @ApiBearerAuth()

    @ApiOperation({
        summary:
            "Registrar asistencia de un paciente del médico autenticado"
    })

    @ApiParam({
        name: "idReserva",
        type: Number,
        description: "ID de la reserva"
    })

    @ApiBody({
        type: RegistrarAsistenciaDto
    })
    
    @ApiOkResponse({
        description:
            "Asistencia registrada correctamente. " +
            "La reserva cambia de ACTIVO a ATENDIDO o AUSENTE."
    })

    @ApiBadRequestResponse({
        description:
            "La reserva no está activa, el estado enviado " +
            "no es válido o el ID de reserva tiene un formato incorrecto."
    })

    @ApiUnauthorizedResponse({
        description:
            "Token JWT ausente, inválido o expirado."
    })

    @ApiForbiddenResponse({
        description:
            "El usuario autenticado no tiene el rol MEDICO."
    })

    @ApiNotFoundResponse({
        description:
            "La reserva no existe, no pertenece al médico autenticado " +
            "o no existe un médico asociado al usuario."
    })

    async registrarAsistencia(
        @Req() request: RequestAutenticada,
        @Param("idReserva", ParseIntPipe) idReserva: number,
        @Body() dto: RegistrarAsistenciaDto
    ): Promise<void> {

        // Identificar al médico autenticado
        const medico = await this.service.obtenerMedicoPorUsuario(
            request.user.id
        );

        // Registrar el estado de asistencia
        await this.service.registrarAsistencia(
            medico.id,
            idReserva,
            dto.estado
        );
    }
}
