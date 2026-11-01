import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthStore } from '../../auth/auth-store';

@Component({
    selector: 'app-medico-layout',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive
    ],
    templateUrl: './medico-layout.html',
    styleUrl: './medico-layout.css',
})
export class MedicoLayout {

    constructor(public authStore: AuthStore) {}

}