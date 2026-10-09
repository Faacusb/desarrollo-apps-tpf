import { Column, Entity,OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { EstadosUsuarioEnum } from '../../common/enums/estados-usuario.enum.js';
import { RolesUsuarioEnum } from '../../common/enums/roles.enum.js';
import type { Reserva } from '../../reservas/entities/reserva.entity.js';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', unique: true })
  documento!: string;

  @Column({ type: 'text' })
  apellidos!: string;

  @Column({ type: 'text' })
  nombres!: string;

  @Column({ type: 'text' })
  email!: string;

  @Column({ type: 'text' })
  clave!: string;

  @Column({
    type: 'enum',
    enum: EstadosUsuarioEnum,
    enumName: 'estados_usuarios',
  })
  estado!: EstadosUsuarioEnum;

  @Column({
    type: 'enum',
    enum: RolesUsuarioEnum,
    enumName: 'roles_usuarios',
  })
  rol!: RolesUsuarioEnum;

  @OneToMany('Reserva', (reserva: Reserva) => reserva.paciente)
  reservas!: Reserva[];
}
    //para cuando se haga agregar esto al final
    //@OneToMany('Reserva', (reserva: Reserva) => reserva.paciente)
    //reservas!: Reserva[];