import {Injectable,UnauthorizedException,} from '@nestjs/common'; 
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    
  ) {}

  async login(dto: LoginDto): Promise<{ accessToken: string}> {
  
    const usuario = await this.usuariosService.buscarUsuarioActivoPorEmail(dto.email);

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    
    if (!bcrypt.compareSync(dto.clave, usuario.clave)) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = {
      sub: usuario.id,
      email: usuario.email,
      rol: usuario.rol,
    };

    return {
      accessToken: this.jwtService.sign(payload),  
    };
  }
}
   