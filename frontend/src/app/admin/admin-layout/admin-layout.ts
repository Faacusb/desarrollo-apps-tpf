import { Component } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";

export interface Menu{
    label: string;
    ruta: string;
    icono: string
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

    menu: Menu[] = [];
    constructor(private router: Router){ }

    //metodo 
    cerrarSesion(): void{
        sessionStorage.removeItem('accessToken');
        this.router.navigate(['/reservas'])
    }
}