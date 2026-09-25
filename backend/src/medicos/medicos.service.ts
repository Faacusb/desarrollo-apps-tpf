import { InjectRepository } from "@nestjs/typeorm";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Medico } from "./entities/medico.entity.js";
import { Repository } from "typeorm";
import { ActulizarValorConsultaDto } from "./dto/actualizar-valor-consulta.dto.js";
//consultar si está bien

@Injectable()
export class MedicosService { 

    constructor(@InjectRepository(Medico) private readonly repository: Repository<Medico>) { }




    //metodo actualizar valor consulta ADMIN
    async actualizarValorConsulta(id: number, dto: ActulizarValorConsultaDto): Promise<void> {
        const medico: Medico | null = await this.repository.findOneBy( { id } );

        if (!medico) {
            throw new NotFoundException("No existe el médico");
        }

        this.repository.merge(medico, dto);
        await this.repository.save(medico);
    }
}