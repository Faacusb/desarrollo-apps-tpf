
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Medico } from "./entities/medico.entity.js";
import { Reserva } from "../reservas/entities/reserva.entity.js";
import { MedicosController } from "./medicos.controller.js";
import { MedicosService } from "./medicos.service.js";
import { AuthModule } from "../auth/auth.module.js";
import { UsuariosModule } from "../usuarios/usuarios.module.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([Medico, Reserva]),
        AuthModule,
        UsuariosModule
    ],
    controllers: [MedicosController],
    providers: [MedicosService],
    exports: []
})
export class MedicosModule {

}