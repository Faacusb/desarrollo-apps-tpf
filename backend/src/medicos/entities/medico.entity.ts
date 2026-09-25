import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Reserva } from "../../reservas/entities/reserva.entity.js";

@Entity({ name: "medicos" })
export class Medico{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'id_usuario' })
    idUsuario: number

    @Column()
    matricula: number

    @Column({ name: 'valor_consulta' })
    valorConsulta: number //necesario para admin

    @OneToMany('Reserva', (reserva: Reserva) => reserva.medico)
    reservas!: Reserva[]
}