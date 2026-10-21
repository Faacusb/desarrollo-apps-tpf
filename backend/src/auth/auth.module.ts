import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { AuthGuard} from './guards/auth.guard.js';
import { RolesGuard } from './guards/roles.guard.js';


@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '8h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,AuthGuard, RolesGuard],
  exports: [RolesGuard, AuthGuard],
})
export class AuthModule {}