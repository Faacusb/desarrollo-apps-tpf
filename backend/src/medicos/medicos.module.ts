import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Medico } from "./entities/medico.entity.js";
import { MedicosController } from "./medicos.controller.js";
import { MedicosService } from "./medicos.service.js";


@Module({
    imports: [TypeOrmModule.forFeature([Medico])],
    controllers: [MedicosController],
    providers: [MedicosService],
    exports: []
})
export class MedicosModule{ 

}