import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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
}