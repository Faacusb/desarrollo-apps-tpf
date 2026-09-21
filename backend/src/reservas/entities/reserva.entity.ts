import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { EstadosReservaEnum } from "...../estados-reserva.enum.js";



@Entity({ name: "Reserva" })
export class Reserva {

    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    nombre!: string;

    @Column()
    fecha_hora!: Date;

    @Column({ name: 'correo_electronico', nullable: true, length: 100 })
    correoElectronico!: string;

    @Column({ type: 'enum', enum: EstadosReservaEnum })
    estado!: EstadosReservaEnum;

}

