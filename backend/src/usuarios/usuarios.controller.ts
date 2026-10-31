import {
    Controller,
    Get,
    UseGuards
} from "@nestjs/common";

import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiOkResponse,
    ApiUnauthorizedResponse,
    ApiForbiddenResponse
} from "@nestjs/swagger";

import { AuthGuard } from "../auth/guards/auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesUsuarioEnum } from "../common/enums/roles.enum.js";
import { UsuariosService } from "./usuarios.service.js";

@ApiTags("Usuarios")
@Controller("usuarios")
export class UsuariosController {

    constructor(
        private readonly service: UsuariosService
    ) {}

    @Get("pacientes")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @ApiBearerAuth()

    @ApiOperation({
        summary: "Listar pacientes activos",
        description:
            "Obtiene el listado de pacientes activos registrados " +
            "en el sistema. Disponible únicamente para usuarios " +
            "con rol ADMINISTRADOR."
    })

    @ApiOkResponse({
        description: "Listado de pacientes obtenido correctamente.",
        schema: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "integer",
                        example: 1
                    },
                    nombres: {
                        type: "string",
                        example: "Lucía"
                    },
                    apellidos: {
                        type: "string",
                        example: "Gómez"
                    },
                    email: {
                        type: "string",
                        example: "lucia.gomez@example.com"
                    }
                }
            }
        }
    })

    @ApiUnauthorizedResponse({
        description:
            "No se proporcionó un token JWT válido."
    })

    @ApiForbiddenResponse({
        description:
            "El usuario autenticado no tiene rol ADMINISTRADOR."
    })

    async obtenerPacientesAdmin() {
        return await this.service.obtenerPacientesAdmin();
    }
}
