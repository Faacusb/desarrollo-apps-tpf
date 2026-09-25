import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reserva } from "./entities/reserva.entity.js";
import { Medico } from "../medicos/entities/medico.entity.js";
import { Usuario } from "../usuarios/entities/usuario.entity.js" //todavía no está implementado
import { ReservasController } from "./reservas.controller.js";
import { ReservasService } from "./reservas.service.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reserva, Medico, Usuario])
    ],
    controllers: [
        ReservasController
    ],
    providers: [
        ReservasService
    ],
    exports: []
})
export class ReservasModule { }
