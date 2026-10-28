import { Component, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

interface Turno {
  id: number;
  medico: string;
  fechaHora: string;
  estado: 'ACTIVO' | 'ATENDIDO' | 'AUSENTE' | 'CANCELADO';
}

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule,DatePipe, TableModule,ButtonModule, DialogModule],
  templateUrl: './mis-turnos.html',
  styleUrl: './mis-turnos.css'
})
export class MisTurnosComponent {
  turnos: Turno[] = [];

  visible = signal(false);
  turnoSeleccionado: Turno | null = null;

  puedeCancelar(turno: Turno): boolean {
    if (turno.estado !== 'ACTIVO') {
      return false;
    }

    const fechaTurno = new Date(turno.fechaHora);

    if (Number.isNaN(fechaTurno.getTime())) {
      return false;
    }

    const diaAnterior = new Date(fechaTurno);
    diaAnterior.setDate(diaAnterior.getDate() - 1);

    return new Date() < diaAnterior;
  }

  abrirConfirmacion(turno: Turno): void {
    if (!this.puedeCancelar(turno)) {
      alert('Este turno ya no se puede cancelar.');
      return;
    }

    this.turnoSeleccionado = turno;
    this.visible.set(true);
  }

  cerrarDialog(): void {
    this.visible.set(false);
    this.turnoSeleccionado = null;
  }

  confirmarCancelacion(): void {
    const turno = this.turnoSeleccionado;

    if (!turno || !this.puedeCancelar(turno)) {
      alert('Este turno ya no se puede cancelar.');
      this.cerrarDialog();
      return;
    }
    turno.estado = 'CANCELADO';

    this.cerrarDialog();
  }
}
