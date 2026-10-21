import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosService } from './usuarios.service.js';
import { Usuario } from './entities/usuario.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [UsuariosService],
  exports: [TypeOrmModule, UsuariosService],
})

export class UsuariosModule {}