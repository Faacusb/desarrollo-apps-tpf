import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service.js';
import { LoginDto } from './dto/login.dto.js';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica a un usuario mediante su correo electrónico y contraseña. ' +
      'Si las credenciales son válidas y el usuario está activo, devuelve un token JWT.',
  })
  @ApiBody({
    type: LoginDto,
    description: 'Credenciales del usuario',
  })
  @ApiOkResponse({
    description: 'Inicio de sesión exitoso.',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'Token JWT de autenticación',
          example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
      required: ['accessToken'],
    },
  })
  @ApiBadRequestResponse({
    description: 'Datos de entrada inválidos.',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciales inválidas o usuario inactivo.',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
