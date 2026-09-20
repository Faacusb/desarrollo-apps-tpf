import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Reserva } from "./entity/reserva.entity.js";
import { ReservasController } from "./reservas.controller.js";
import { ReservaService } from "../../../service/reserva.service.js";

@Module({
    imports: [
        TypeOrmModule.forFeature([Reserva])
    ],
    controllers: [
        ReservasController
    ],
    providers: [
        ReservaService
    ],
    exports: []
})
export class ReservasModule { }
