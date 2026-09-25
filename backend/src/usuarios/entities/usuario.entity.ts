import { Reserva } from "../../reservas/entities/reserva.entity.js"
import { OneToMany } from "typeorm"




    //para cuando se haga agregar esto al final
    @OneToMany('Reserva', (reserva: Reserva) => reserva.paciente)
    reservas!: Reserva[];