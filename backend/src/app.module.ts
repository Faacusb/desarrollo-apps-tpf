import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
//no implementado: import { AuthModule } from './modules/auth/auth.module.js';
import { MedicosModule } from './medicos/medicos.module.js';
import { ReservasModule } from './reservas/reservas.module.js';
import { UsuariosModule } from './usuarios/usuarios.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      autoLoadEntities: true,
      logging: process.env.DB_LOGGING === 'true',
      logger: 'advanced-console',
    }),
      //AuthModule,
      UsuariosModule,
      MedicosModule,
      ReservasModule],
  controllers: [],
  providers: [],
  exports: []
})
export class AppModule {}
