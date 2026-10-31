import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { ReservaTurnosComponent } from './features/reserva-turnos/reserva-turnos.component';

@NgModule({
  declarations: [
    AppComponent,
    ReservaTurnosComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }.
