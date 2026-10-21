import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { UsuariosService } from "../../usuarios/usuarios.service.js";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private usuariosService: UsuariosService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('Token requerido');
        }
        
        try {
            const payload = await this.jwtService.verifyAsync(token);
            
            const usuario = await this.usuariosService.buscarUsuarioActivoPorEmail(payload.email);
            if (!usuario) {
                throw new UnauthorizedException('Usuario no encontrado');
            }

            request.user = {
                id: usuario.id, 
                email: usuario.email, 
                rol: usuario.rol,
            };

            return true;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}