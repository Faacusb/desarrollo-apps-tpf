# Análisis de Errores de Lógica en el Backend

## Resumen General
El proyecto es un sistema de gestión de reservas médicas construido con NestJS + TypeORM + PostgreSQL. Se han identificado **múltiples errores críticos de lógica, arquitectura y seguridad** que impiden que la aplicación funcione correctamente.

---

## 🔴 ERRORES CRÍTICOS (Bloquean el funcionamiento)

### 1. **Módulo Auth completamente vacío**
- `auth.module.ts`, `auth.service.ts`, `auth.controller.ts` están vacíos (0 bytes)
- `auth.guard.ts` y `roles.guard.ts` solo tienen comentarios
- **Impacto**: No hay autenticación ni autorización. Los decoradores `@UseGuards(AuthGuard)` y `@Roles()` están comentados en los controladores, dejando todos los endpoints expuestos.

### 2. **Módulo Usuarios incompleto**
- Solo existe `usuario.entity.ts` y `usuarios.module.ts`
- **Falta**: `usuarios.service.ts`, `usuarios.controller.ts`, DTOs para crear/actualizar usuarios
- **Impacto**: No se pueden registrar usuarios, hacer login, ni gestionar pacientes/médicos

### 3. **Conflicto de rutas en ReservasController**
```typescript
// Línea 16-19 y 63-66: DOS @Post() en el mismo controlador
@Post() crear(@Body() datos: CreateReservaDto) { ... }
@Post() async crearReservaAdmin(@Body() dto: CrearReservaAdminDto) { ... }
```
- **Impacto**: NestJS solo registrará la última ruta. El endpoint de creación de reserva para pacientes no funcionará.

### 4. **Conflicto de rutas GET duplicadas**
```typescript
// Línea 33-36 y 72-75: DOS @Get() sin parámetros
@Get() listar() { ... }
@Get() async obtenerTodasLasReservas(@Query() filtros: FiltrarReservasDto) { ... }
```
- **Impacto**: Solo funcionará el endpoint admin con filtros.

---

## 🟠 ERRORES DE LÓGICA DE NEGOCIO

### 5. **ReservasService.create() - Variables no definidas** (líneas 35-83)
```typescript
const { fechaHora, idMedico, idPaciente } = datos; // datos es CrearReservaAdminDto
const fechaElegida = this.parsearFecha(fechaHora);  // parsearFecha espera string fecha, no fechaHora

if (!HORARIOS_DISPONIBLES.includes(hora)) { ... }  // ❌ 'hora' NO ESTÁ DEFINIDA
```
- `CrearReservaAdminDto` tiene `fechaHora` (ISO string completo), no `fecha` + `hora` separados
- La variable `hora` no existe en el scope
- `parsearFecha()` crea `new Date(\`${fecha}T00:00:00\`)` - si le pasas `fechaHora` (ej: "2026-12-01T10:00:00.000Z"), creará fecha inválida

### 6. **ReservasService.obtenerHorarios() - Variables incorrectas** (líneas 85-101)
```typescript
async obtenerHorarios(fechaHora: string, idMedico: number) {
  const reservas = await this.repository.find({
    where: { fechaHora, idMedico },  // ❌ La entidad Reserva NO tiene campo 'fechaHora' como string, es Date
    select: { hora: true },          // ❌ La entidad Reserva NO tiene campo 'hora' separado
  });
  return {
    fecha,      // ❌ 'fecha' NO DEFINIDA (parámetro es fechaHora)
    medicoId,   // ❌ 'medicoId' NO DEFINIDA (parámetro es idMedico)
    ...
  };
}
```
- La entidad `Reserva` tiene `fechaHora: Date` (campo único), no `fecha` + `hora` separados
- El código asume una estructura de entidad que no existe

### 7. **ReservasService.obtenerReservaPacientes() - Query incorrecta** (línea 124)
```typescript
const reservas: Reserva[] = await this.repository.find({ 
  where: { paciente: true },  // ❌ TypeORM: { paciente: true } no filtra por ID de paciente
  order: { id: "ASC" }
});
```
- Trae **TODAS** las reservas de **TODOS** los pacientes, no del paciente solicitado (`idPaciente`)
- Fuga de datos: un paciente vería reservas de otros pacientes

### 8. **ReservasService.cancelarReservaPaciente() - Lógica invertida** (líneas 150-177)
```typescript
const reservas: Reserva[] | null = await this.repository.find({ 
  relations: {paciente: true}, order: { id: 'ASC' } 
});
const reserva = reservas[0];  // ❌ Toma la PRIMERA reserva de CUALQUIER paciente

if (reserva.estado === EstadosReservaEnum.ACTIVO) {
  throw new BadRequestException("La Reserva NO esta activa");  // ❌ LÓGICA INVERTIDA
}
```
- No filtra por `idPaciente` del parámetro
- Toma la primera reserva de la BD (cualquier paciente)
- Lanza error si está ACTIVO (debería permitir cancelar si está ACTIVO)
- Compara fecha con `diaAnterior` pero `fechaReserva` usa `reserva.fechaHora` que no existe en la entidad (es `fechaHora` Date)

### 9. **ReservasService.crearReservaAdmin() - Inconsistencia de campos** (líneas 181-215)
```typescript
const fecha = new Date(dto.fechaHora);
const estaOcupado = await this.repository.findOne({
  where: {
    medico: {id: dto.idMedico },
    fechaHora: fecha,
    estado: EstadosReservaEnum.ACTIVO
  },
});
// ...
reserva.fechaHora = fecha;  // ✅ Correcto
```
- Esta parte está **bien implementada** (usa `fechaHora` como Date y relations correctas)
- **Pero** el método `create()` anterior (línea 35) tiene la lógica rota para el mismo propósito

### 10. **Validación de horario en create() rota** (líneas 57-61)
```typescript
if (!HORARIOS_DISPONIBLES.includes(hora)) {  // 'hora' undefined
  throw new BadRequestException('El horario debe estar entre las 08:00 y las 15:00...');
}
```
- Debería extraer la hora de `fechaHora` (ej: `new Date(fechaHora).getHours()`)
- `HORARIOS_DISPONIBLES` son strings "08:00", "09:00" - comparar con número fallará

---

## 🟡 ERRORES DE ARQUITECTURA Y DISEÑO

### 11. **Entidad Reserva inconsistente**
- `reserva.entity.ts` (actual): usa `fechaHora: Date` + relaciones `@ManyToOne` con `medico` y `paciente`
- `reserva.entity.nuevo.ts`: usa `fecha: string` + `hora: string` + `pacienteId: number` + `medicoId: number`
- **El servicio usa mezcla de ambos enfoques** - inconsistencia total

### 12. **DTOs inconsistentes**
- `CreateReservaDto` (paciente): usa `fecha: string` + `hora: string` + `medicoId` + `pacienteId`
- `CrearReservaAdminDto` (admin): usa `fechaHora: string` (ISO) + `idMedico` + `idPaciente` + `id` (¿?) + `estado`
- **El service `create()` espera `CrearReservaAdminDto` pero el controller `@Post()` pasa `CreateReservaDto`**

### 13. **Valor de consulta hardcodeado**
```typescript
const VALOR_CONSULTA = 5000;  // Línea 24
// ...
valorConsulta: VALOR_CONSULTA,  // Línea 81
```
- Ignora `medico.valorConsulta` que se puede configurar por admin
- Debería obtener el valor del médico asignado

### 14. **UsuariosModule exporta TypeOrmModule incorrectamente**
```typescript
exports: [TypeOrmModule]  // ❌ Debería exportar el repositorio o el service
```
- Otros módulos que importen `UsuariosModule` no tendrán acceso al repositorio de `Usuario`

### 15. **ReservasModule importa Usuario pero no exporta nada**
```typescript
imports: [TypeOrmModule.forFeature([Reserva, Medico, Usuario])]
exports: []  // ❌ Otros módulos no pueden usar estos repositorios
```

---

## 🔵 ERRORES DE SEGURIDAD

### 16. **Sin autenticación/autorización real**
- Guards vacíos
- Decoradores de roles comentados
- Cualquiera puede acceder a endpoints admin (`crearReservaAdmin`, `obtenerTodasLasReservas`, `cancelarReservaAdmin`)

### 17. **Contraseña en texto plano en entidad Usuario**
```typescript
@Column({ type: 'text' })
clave!: string;  // ❌ Sin hashing (bcrypt está en dependencias pero no se usa)
```

### 18. **Exposición de datos sensibles en DTOs**
- `ListReservaDto` incluye `email` del paciente
- `ListMedicoDto` incluye `valorConsulta` (información comercial)

---

## 🟢 ERRORES MENORES / CODE SMELLS

### 19. **Typos en nombres de clases/archivos**
- `ActulizarValorConsultaDto` → debería ser `ActualizarValorConsultaDto`
- `2create-reserva.dto.ts` → nombre con número inicial (mal practice)
- `cancelarReservapacinte` → typo en método controller

### 20. **Imports no usados / código muerto**
- `CambiarEstadoDto` importado en controller pero no usado
- `ListReservaDTO` importado comentado
- `forwardRef` importado en service pero no usado
- Comentarios `//todavía no está implementado` en imports

### 21. **Test E2E inválido**
```typescript
.expect('Hello World!');  // La app no tiene endpoint '/' que devuelva esto
```

### 22. **Synchronize: false sin migraciones**
```typescript
synchronize: false,  // En producción OK, pero en dev requiere migraciones manuales
```
- No hay scripts de migración en package.json
- `typeorm` CLI no configurado

### 23. **Validación de fecha en parsearFecha() frágil**
```typescript
const fechaElegida = new Date(`${fecha}T00:00:00`);  // Asume formato YYYY-MM-DD
```
- Si `fecha` ya trae hora (ISO string), crea fecha inválida
- No valida zona horaria

### 24. **Falta validación de superposición de horarios en obtenerHorarios**
- Solo filtra por `fechaHora` exacta, no considera duración de consulta
- Si una reserva es a las 10:00, ¿bloquea 10:00-11:00 o solo el instante 10:00?

---

## 📋 PLAN DE CORRECCIÓN PRIORIZADO

### Fase 1: Críticos (Bloquean funcionamiento)
1. [ ] Implementar módulo Auth completo (JWT, guards, login, register)
2. [ ] Implementar UsuariosService y UsuariosController
3. [ ] Fixear rutas duplicadas en ReservasController
4. [ ] Corregir ReservasService.create() - variables undefined y parsing de fecha
5. [ ] Corregir ReservasService.obtenerHorarios() - campos entidad incorrectos
6. [ ] Corregir ReservasService.obtenerReservaPacientes() - filtro por paciente
7. [ ] Corregir ReservasService.cancelarReservaPaciente() - lógica y filtro

### Fase 2: Arquitectura
8. [ ] Unificar entidad Reserva (eliminar .nuevo.ts o migrar)
9. [ ] Unificar DTOs (consistentes entre paciente y admin)
10. [ ] Fixear exports de módulos (UsuariosModule, ReservasModule)
11. [ ] Usar medico.valorConsulta en lugar de constante hardcodeada

### Fase 3: Seguridad
12. [ ] Hash de contraseñas con bcrypt
13. [ ] Implementar guards y proteger endpoints admin
14. [ ] Revisar exposición de datos en DTOs

### Fase 4: Calidad
15. [ ] Corregir typos (Actulizar → Actualizar, etc.)
16. [ ] Limpiar imports muertos y código comentado
17. [ ] Fixear test E2E
18. [ ] Configurar migraciones TypeORM
19. [ ] Agregar validaciones robustas de fecha/hora

---

## 📁 ARCHIVOS QUE REQUIEREN CAMBIOS

| Archivo | Prioridad | Tipo |
|---------|-----------|------|
| `src/auth/auth.module.ts` | 🔴 Crítica | Nuevo |
| `src/auth/auth.service.ts` | 🔴 Crítica | Nuevo |
| `src/auth/auth.controller.ts` | 🔴 Crítica | Nuevo |
| `src/auth/guards/auth.guard.ts` | 🔴 Crítica | Reescribir |
| `src/auth/guards/roles.guard.ts` | 🔴 Crítica | Reescribir |
| `src/usuarios/usuarios.service.ts` | 🔴 Crítica | Nuevo |
| `src/usuarios/usuarios.controller.ts` | 🔴 Crítica | Nuevo |
| `src/usuarios/dto/*.ts` | 🔴 Crítica | Nuevo |
| `src/reservas/reservas.controller.ts` | 🔴 Crítica | Fix rutas |
| `src/reservas/reservas.service.ts` | 🔴 Crítica | Fix lógica |
| `src/reservas/entities/reserva.entity.ts` | 🟠 Alta | Revisar |
| `src/reservas/entities/reserva.entity.nuevo.ts` | 🟠 Alta | Eliminar o usar |
| `src/reservas/dto/*.ts` | 🟠 Alta | Unificar |
| `src/usuarios/usuarios.module.ts` | 🟡 Media | Fix exports |
| `src/reservas/reservas.module.ts` | 🟡 Media | Fix exports |
| `src/medicos/medicos.service.ts` | 🟢 Baja | Usar valorConsulta |
| `test/app.e2e-spec.ts` | 🟢 Baja | Fix test |

---

## NOTAS ADICIONALES

1. **El proyecto parece estar a medio implementar** - hay código de "integrante 1" y "integrante 2" comentado, sugiriendo trabajo en equipo sin merge adecuado.

2. **Dos enfoques de entidad Reserva coexisten** - uno relacional (ManyToOne) y uno con IDs planos. Hay que decidir cuál usar y migrar todo.

3. **Falta capa de aplicación** - no hay casos de uso / services que orquesten lógica compleja (ej: crear reserva verificando disponibilidad, conflictos, valor consulta del médico, etc.)

4. **TypeORM config** - `logger: 'advanced-console'` puede no ser válido en TypeORM 1.x (verificar docs)

5. **Validación de zona horaria** - todas las fechas se manejan como UTC/local sin especificar, causará bugs en producción.