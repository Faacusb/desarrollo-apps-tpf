import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EstadosReservaEnum } from "../../common/enums/estados-reserva.enum.js";
import type { Medico } from "../../medicos/entities/medico.entity.js"
import type { Usuario } from "../../usuarios/entities/usuario.entity.js"



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

    //relaciones agregadas del admin - integrante 2
    @ManyToOne("Medico", (medico: Medico) => medico.reservas)
    @JoinColumn({ name: "id_medico" })
    medico: Medico;

    @ManyToOne("Usuario", (usuario: Usuario) => usuario.reservas)
    @JoinColumn({ name: "id_paciente" })
    paciente: Usuario;
}

