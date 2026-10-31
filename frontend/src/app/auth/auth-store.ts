import { inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";

@Injectable({
    providedIn: "root"
})
export class AuthStore {

    private readonly router: Router = inject(Router);

    guardarToken(token: string): void {
        sessionStorage.setItem("accessToken", token);
    }

    obtenerToken(): string | null {
        return sessionStorage.getItem("accessToken");
    }

    obtenerRol(): string | null {

    const token = this.obtenerToken();

    if (!token) {
        return null;
    }

    try {

        const parte = token.split('.')[1];

        if (!parte) {
            return null;
        }

        let base64 = parte
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        base64 += '='.repeat((4 - base64.length % 4) % 4);

        const payload = JSON.parse(atob(base64));

        // Comprobar vencimiento del token
        if (
            typeof payload.exp !== 'number' ||
            payload.exp * 1000 <= Date.now()
        ) {
            sessionStorage.removeItem('accessToken');
            return null;
        }

        return typeof payload.rol === 'string'
            ? payload.rol
            : null;

    } catch {
        return null;
    }
}

    cerrarSesion(): void {

        sessionStorage.removeItem("accessToken");

        this.router.navigateByUrl("/login");
    }
}