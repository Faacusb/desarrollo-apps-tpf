import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  fecha!: string;

  @Column({ type: 'time' })
  hora!: string;

  @Column({
    name: 'valor_consulta',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorConsulta!: number;

  @Column({ name: 'paciente_id' })
  pacienteId!: number;

  @Column({ name: 'medico_id' })
  medicoId!: number;
}