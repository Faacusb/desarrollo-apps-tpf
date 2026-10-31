import {
    Body,
    Controller,
    Post,
    Get,
    Param,
    Patch,
    Put,
    Query,
    ParseIntPipe,
    BadRequestException,
    UseGuards
} from "@nestjs/common";

import {
    ApiBadRequestResponse,
    ApiBearerAuth,
    ApiBody,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiForbiddenResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { ReservasService } from "./reservas.service.js";
import { ListReservaDto } from "./dto/list-reserva.dto.js";
import { FiltrarReservasDto } from "./dto/filtrar-reservas.dto.js";
import { CreateReservaDto } from "./dto/2create-reserva.dto.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { AuthGuard } from "../auth/guards/auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { RolesUsuarioEnum } from "../common/enums/roles.enum.js";

@ApiTags("Reservas")
@Controller("reservas")
export class ReservasController {

    constructor(private readonly reservasService: ReservasService) {}

    // ==================== PACIENTE ====================

    @Post()
    @Roles(RolesUsuarioEnum.PACIENTE)
    @UseGuards(AuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Crear una reserva como paciente",
        description:
            "Registra una reserva para el médico, paciente, fecha y hora indicados. " +
            "Solo permite fechas futuras dentro de los próximos 30 días y horarios " +
            "de 08:00 a 15:00. Requiere rol PACIENTE."
    })
    @ApiBody({
        type: CreateReservaDto,
        description: "Datos de la nueva reserva"
    })
    @ApiCreatedResponse({
        description:
            "Reserva creada. El servicio devuelve la entidad guardada, " +
            "incluidas sus relaciones con médico y paciente.",
        schema: {
            type: "object",
            properties: {
                id: { type: "integer", example: 10 },
                fechaHora: { type: "string", format: "date-time", example: "2026-11-13T14:00:00.000Z" },
                estado: { type: "string", example: "ACTIVO" },
                valorConsulta: { type: "number", example: 40000 },
                medico: { type: "object", description: "Entidad del médico asociada a la reserva" },
                paciente: { type: "object", description: "Entidad del paciente asociada a la reserva" }
            }
        }
    })
    @ApiBadRequestResponse({
        description: "Datos inválidos, fecha pasada, más de 30 días de anticipación u horario no permitido."
    })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol PACIENTE." })
    @ApiNotFoundResponse({ description: "Médico o paciente no encontrado." })
    @ApiConflictResponse({ description: "El médico o paciente ya tiene una reserva activa en ese horario." })
    async crear(@Body() datos: CreateReservaDto) {
        return this.reservasService.create(datos);
    }

    @Get("horarios-disponibles")
    @ApiOperation({
        summary: "Consultar horarios disponibles de un médico",
        description:
            "Consulta los turnos libres de un médico para una fecha. " +
            "Considera horarios de 08:00 a 15:00 y excluye las reservas activas. " +
            "No requiere autenticación."
    })
    @ApiQuery({
        name: "fecha",
        type: String,
        required: true,
        example: "2026-11-13",
        description: "Fecha en formato YYYY-MM-DD"
    })
    @ApiQuery({
        name: "medicoId",
        type: Number,
        required: true,
        example: 1,
        description: "ID del médico"
    })
    @ApiOkResponse({
        description: "Horarios disponibles para la fecha y el médico consultados.",
        schema: {
            type: "object",
            properties: {
                fecha: { type: "string", example: "2026-11-13" },
                medicoId: { type: "integer", example: 1 },
                disponibles: {
                    type: "array",
                    items: { type: "string" },
                    example: ["08:00", "09:00", "11:00", "15:00"]
                }
            }
        }
    })
    @ApiBadRequestResponse({
        description: "Falta la fecha, la fecha no es válida o medicoId no es un número entero."
    })
    async obtenerHorarios(
        @Query("fecha") fecha: string,
        @Query("medicoId", ParseIntPipe) medicoId: number
    ) {
        if (!fecha?.trim()) {
            throw new BadRequestException('El parámetro "fecha" es obligatorio.');
        }

        return this.reservasService.obtenerHorarios(fecha, medicoId);
    }

    @Get("paciente/:id")
    @Roles(RolesUsuarioEnum.PACIENTE)
    @UseGuards(AuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Listar reservas de un paciente",
        description:
            "Devuelve las reservas del paciente indicado, ordenadas por fecha y hora. " +
            "Requiere rol PACIENTE."
    })
    @ApiParam({
        name: "id",
        type: Number,
        example: 2,
        description: "ID del paciente"
    })
    @ApiOkResponse({
        description: "Reservas del paciente, o lista vacía si no tiene reservas.",
        type: ListReservaDto,
        isArray: true
    })
    @ApiBadRequestResponse({ description: "El ID del paciente no es un número entero válido." })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol PACIENTE." })
    @ApiNotFoundResponse({ description: "El paciente indicado no existe." })
    async obtenerReserva(
        @Param("id", ParseIntPipe) id: number
    ): Promise<ListReservaDto[]> {
        return await this.reservasService.obtenerReservaPacientes(id);
    }

    @Patch(":id")
    @Roles(RolesUsuarioEnum.PACIENTE)
    @UseGuards(AuthGuard, RolesGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Cancelar una reserva como paciente",
        description:
            "Cambia una reserva ACTIVA al estado CANCELADO. " +
            "Solo puede cancelarse hasta el día anterior al turno. " +
            "Requiere rol PACIENTE."
    })
    @ApiParam({
        name: "id",
        type: Number,
        example: 10,
        description: "ID de la reserva que se quiere cancelar"
    })
    @ApiOkResponse({ description: "Reserva cancelada correctamente. No devuelve contenido." })
    @ApiBadRequestResponse({
        description: "La reserva no está activa o se superó el plazo permitido para cancelarla."
    })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol PACIENTE." })
    @ApiNotFoundResponse({ description: "La reserva indicada no existe." })
    async cancelarReservapaciente(
        @Param("id") id: number
    ): Promise<void> {
        return await this.reservasService.cancelarReservaPaciente(id);
    }

    // ==================== ADMINISTRADOR ====================

    @Post("admin")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Crear una reserva como administrador",
        description:
            "Crea una reserva para un paciente y médico indicados, " +
            "aplicando las mismas validaciones de fecha, horario y disponibilidad. " +
            "Requiere rol ADMINISTRADOR."
    })
    @ApiBody({ type: CreateReservaDto, description: "Datos de la nueva reserva" })
    @ApiCreatedResponse({
        description: "Reserva creada. Devuelve el identificador generado.",
        schema: {
            type: "object",
            properties: {
                id: { type: "integer", example: 10 }
            },
            required: ["id"]
        }
    })
    @ApiBadRequestResponse({ description: "Fecha u horario inválido, o datos obligatorios incorrectos." })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol ADMINISTRADOR." })
    @ApiNotFoundResponse({ description: "Médico o paciente no encontrado." })
    @ApiConflictResponse({ description: "El horario ya está ocupado por el médico o paciente." })
    async crearReservaAdmin(@Body() datos: CreateReservaDto): Promise<{ id: number }> {
        return await this.reservasService.crearReservaAdmin(datos);
    }

    @Get()
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Listar y filtrar todas las reservas",
        description:
            "Obtiene las reservas ordenadas por ID. Permite filtrar opcionalmente " +
            "por estado, médico, fecha desde y fecha hasta. " +
            "Requiere rol ADMINISTRADOR."
    })
    @ApiOkResponse({
        description: "Listado de reservas coincidentes con los filtros.",
        type: ListReservaDto,
        isArray: true
    })
    @ApiBadRequestResponse({ description: "Uno o más filtros no tienen el formato esperado." })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol ADMINISTRADOR." })
    async obtenerTodasLasReservas(@Query() filtros: FiltrarReservasDto): Promise<ListReservaDto[]> {
        return this.reservasService.obtenerTodasLasReservas(filtros);
    }

    @Put(":id")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @ApiBearerAuth()
    @ApiOperation({
        summary: "Cancelar una reserva como administrador",
        description:
            "Cambia una reserva al estado CANCELADO siempre que el turno " +
            "todavía no haya comenzado. Requiere rol ADMINISTRADOR."
    })
    @ApiParam({
        name: "id",
        type: Number,
        example: 10,
        description: "ID de la reserva que se desea cancelar"
    })
    @ApiOkResponse({ description: "Reserva cancelada correctamente. No devuelve contenido." })
    @ApiBadRequestResponse({ description: "ID incorrecto o turno ya iniciado o finalizado." })
    @ApiUnauthorizedResponse({ description: "Token JWT ausente, inválido o expirado." })
    @ApiForbiddenResponse({ description: "El usuario autenticado no tiene rol ADMINISTRADOR." })
    @ApiNotFoundResponse({ description: "La reserva indicada no existe." })
    async cancelarReservaAdmin(@Param("id", ParseIntPipe) id: number): Promise<void> {
        await this.reservasService.cancelarReservaAdmin(id);
    }
}