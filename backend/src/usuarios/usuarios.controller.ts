import {
    Controller,
    Get,
    UseGuards
} from "@nestjs/common";

import {
    ApiBearerAuth
} from "@nestjs/swagger";
import { AuthGuard } from "../auth/guards/auth.guard.js";
import { RolesGuard } from "../auth/guards/roles.guard.js";
import { Roles } from "../auth/decorators/roles.decorator.js";
import { RolesUsuarioEnum } from "../common/enums/roles.enum.js";
import { UsuariosService } from "./usuarios.service.js";


@Controller("usuarios")
export class UsuariosController {

    constructor(
        private readonly service: UsuariosService
    ) {}

    

    @Get("pacientes")
    @UseGuards(AuthGuard, RolesGuard)
    @Roles(RolesUsuarioEnum.ADMINISTRADOR)
    @ApiBearerAuth()
    async obtenerPacientesAdmin() {
        // Obtener todos los medicos para el admin
        return await this.service.obtenerPacientesAdmin();
    }
}
