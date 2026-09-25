import { Body, Controller, Param, ParseIntPipe, Put, UseGuards } from "@nestjs/common";
import { MedicosService } from "./medicos.service.js";
import { ActulizarValorConsultaDto } from "./dto/actualizar-valor-consulta.dto.js";
import { ApiBearerAuth } from "@nestjs/swagger";



@Controller("medicos")
export class MedicosController {

    constructor(private readonly service: MedicosService) { }

    
    
    
    //endpoint modificar tarifa ADMIN
    //@Roles('ADMINISTRADOR')
    //@UseGuards(AuthGuard)
    @ApiBearerAuth()
    @Put(":id")
    async actualizarValorConsulta(@Param("id", ParseIntPipe) id: number, @Body() dto: ActulizarValorConsultaDto): Promise<void> {

        await this.service.actualizarValorConsulta(id, dto);
    }
}