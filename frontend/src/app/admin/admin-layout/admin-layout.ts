import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { AuthStore } from "../../auth/auth-store";

export interface Menu{
    label: string;
    ruta: string;
}

@Component({
    selector: "app-admin-layout",
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
    ],
    templateUrl: "./admin-layout.html",
    styleUrl: "./admin-layout.css"
})
export class AdminLayout {

    menu: Menu[] = [
        { label: "Monitor de reservas", ruta: "reservas" },
        { label: "Médicos", ruta: "medicos" },
        { label: "Nueva reserva", ruta: "reservas/nueva" },
    ];
    private readonly authStore: AuthStore = inject(AuthStore);

    //metodo 
    cerrarSesion(): void{
        this.authStore.cerrarSesion();
    }
}