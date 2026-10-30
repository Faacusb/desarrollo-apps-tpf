import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { EstadosUsuarioEnum } from '../common/enums/estados-usuario.enum.js';
import { ListUsuarioDto } from './dto/list-usuario.dto.js';
import { RolesUsuarioEnum } from '../common/enums/roles.enum.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>
  ) {}

  async buscarUsuarioActivoPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOne({
      where: { email, estado: EstadosUsuarioEnum.ACTIVO }
    });
  }

  async obtenerPacientesAdmin(): Promise<ListUsuarioDto[]> {
    const pacientes = await this.repository.find({ where: { estado: EstadosUsuarioEnum.ACTIVO, rol: RolesUsuarioEnum.PACIENTE } })
    
    const dtoList: ListUsuarioDto[] = [];
    for (const p of pacientes){
      const dto = new ListUsuarioDto();
      dto.id = p.id;
      dto.nombres = p.nombres;
      dto.apellidos = p.apellidos;
      dto.email = p.email;
      dtoList.push(dto);
    }

    return dtoList
  } 
}