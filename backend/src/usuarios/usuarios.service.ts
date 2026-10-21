import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity.js';
import { EstadosUsuarioEnum } from '../common/enums/estados-usuario.enum.js';

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
}