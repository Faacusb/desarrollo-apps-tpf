# Sistema de Reservas Médicas — Frontend

**Trabajo Final Integrador 2026 — Desarrollo de Aplicaciones Web**  
**Tecnicatura Universitaria en Desarrollo Web**

### Integrantes del grupo de desarrollo

- Mariano Daniel Elean
- Malena del Valle Moyano
- Gustavo Adrian Pereyra
- Facundo Vaca Cardoso
- Joaquin Lautaro Villalba

## Descripción

Frontend web de un sistema de gestión de turnos para una clínica médica. La aplicación permite a los usuarios autenticarse y acceder a las operaciones correspondientes a su rol: **PACIENTE**, **MEDICO** o **ADMINISTRADOR**.

El frontend está desarrollado con **Angular 21**, **TypeScript** y **PrimeNG**, y consume una API REST implementada con **NestJS**, **TypeORM** y **PostgreSQL**.

El alcance de la clínica se limita a **médicos clínicos**. No se gestionan obras sociales, pagos, historias clínicas ni otras especialidades médicas.

## Roles y funcionalidades

| Rol | Funcionalidades habilitadas | Rutas principales |
| --- | --- | --- |
| **PACIENTE** | Consultar sus turnos, solicitar nuevas reservas y cancelar turnos propios hasta el día anterior a la consulta. | `/reservas`, `/reservas/nueva` |
| **MEDICO** | Consultar su agenda de reservas por fecha y marcar los turnos propios como **ATENDIDO** o **AUSENTE**. | `/agenda-medica` |
| **ADMINISTRADOR** | Consultar y filtrar las reservas de la clínica, crear reservas para pacientes, cancelar turnos antes del inicio de la consulta, listar médicos y actualizar el valor de sus consultas. | `/admin/reservas`, `/admin/reservas/nueva`, `/admin/medicos` |

El ingreso se realiza desde `/login`. Solo pueden autenticarse usuarios con credenciales válidas y estado **ACTIVO**. En esta etapa, los usuarios y sus roles son datos preexistentes: **no se incluye un módulo de alta, edición o eliminación de usuarios y roles**.

### Estados de las reservas

- **ACTIVO:** turno reservado y vigente.
- **ATENDIDO:** el médico registró que atendió al paciente.
- **AUSENTE:** el médico registró que el paciente no asistió.
- **CANCELADO:** turno anulado conforme a las reglas de cancelación.

## Reglas de negocio

De acuerdo con la consigna del trabajo:

- El horario de atención es de **08:00 a 16:00**.
- Cada turno tiene una duración de **una hora**.
- No se puede reservar un horario que ya esté ocupado.
- Las reservas pueden realizarse con un máximo de **30 días de anticipación**.
- El valor de la consulta queda **congelado al momento de crear la reserva**; una actualización posterior de la tarifa del médico no modifica el importe de los turnos ya registrados.
- El **PACIENTE** puede cancelar hasta el **día anterior** a la consulta.
- El **ADMINISTRADOR** puede cancelar mientras **no haya comenzado** la consulta.
- El **MEDICO** puede registrar la atención o ausencia de los pacientes de su propia agenda.

Las validaciones definitivas y las restricciones de acceso deben aplicarse en el **backend**; el frontend también realiza validaciones para orientar al usuario.

## Tecnologías y arquitectura

| Capa | Tecnología |
| --- | --- |
| Interfaz web | Angular 21, TypeScript, HTML y CSS |
| Componentes de interfaz | PrimeNG y tema Aura |
| Formularios | Angular Forms / Reactive Forms |
| Navegación | Angular Router con componentes standalone |
| Autenticación | Token JWT y control de acceso por rol |
| Cliente API | Angular HttpClient e interceptor HTTP |
| Backend | NestJS y TypeORM |
| Base de datos | PostgreSQL |
| Documentación | Swagger para backend y Compodoc para frontend |

El proyecto utiliza **componentes standalone**: `src/main.ts` inicializa la aplicación mediante `bootstrapApplication`, `app.config.ts` registra proveedores y `app.routes.ts` define las rutas.

El token JWT se almacena en `sessionStorage` bajo la clave `accessToken`. El servicio `AuthStore` administra la sesión y los guards controlan el acceso a las rutas protegidas de pacientes y médicos. El interceptor HTTP agrega la cabecera `Authorization: Bearer <token>` cuando existe un token.

### Organización principal del frontend

```text
frontend/
├── src/
│   ├── main.ts
│   ├── proxy.conf.json
│   └── app/
│       ├── app.ts
│       ├── app.config.ts
│       ├── app.routes.ts
│       ├── auth/                   # Login, JWT, guards e interceptor
│       ├── Reservas/               # Portal del paciente y turnos
│       ├── agenda-medica/          # Portal del médico y asistencia
│       └── admin/                  # Reservas, médicos y administración
├── angular.json
├── package.json
└── tsconfig.app.json
```

## Requisitos previos

- Node.js y un administrador de paquetes compatible con el proyecto.
- Dependencias del frontend instaladas.
- Backend NestJS y base de datos PostgreSQL configurados y disponibles para utilizar las funciones reales.
- Al menos una cuenta activa con el rol correspondiente para probar cada sección.

> No se deben incluir contraseñas reales, claves JWT ni archivos `.env` con secretos en el repositorio.

## Ejecutar en desarrollo

Desde la carpeta raíz del repositorio, iniciar primero el backend en una terminal:

```powershell
cd backend
npm install
npm run start:dev
```

En una segunda terminal, iniciar Angular:

```powershell
cd frontend
npm install
npm start
```

Abrir la aplicación en **http://localhost:4200/login**.

### Comunicación con el backend

El frontend utiliza rutas relativas bajo `/api/v1`. Durante el desarrollo, el proxy configurado en `src/proxy.conf.json` permite reenviar las peticiones al backend, que se ejecuta localmente en el puerto **3000**, sin incorporar una URL fija en los componentes.

La documentación de la API puede consultarse en **http://localhost:3000/api** cuando Swagger está habilitado en el backend.

## Compilar el frontend

Desde `frontend/`:

```powershell
npm run build
```

Los archivos compilados se generan en `dist/frontend/`.

## Documentación técnica con Compodoc

Los componentes, servicios, guards, interfaces, funciones y propiedades están documentados con comentarios **JSDoc**. Compodoc genera un sitio navegable con esta documentación y el presente README.

Para generar la documentación, desde `frontend/`:

```powershell
npx compodoc -p tsconfig.app.json -d documentation
```

Para visualizarla localmente:

```powershell
npx compodoc -s -d documentation -r 8080
```

Abrir **http://localhost:8080** y consultar las secciones **Components**, **Injectables**, **Guards**, **Interfaces**, **Routes** y **Documentation coverage**.

En la última revisión realizada con Compodoc, las **34 entidades detectadas** alcanzaron el **100 % de cobertura de documentación**. Este porcentaje mide la presencia de documentación en el código; **no equivale a cobertura de pruebas ni garantiza ausencia de errores funcionales**.

## Consideraciones de seguridad y alcance

- Las funcionalidades deben autorizarse según el rol y el estado del usuario autenticado.
- El frontend utiliza controles de navegación; la API debe verificar la autenticación y la autorización de cada operación protegida.
- La clínica no contempla obras sociales ni especialidades diferentes de clínica médica.
- No se desarrollan pantallas de gestión de usuarios o roles, de acuerdo con el alcance definido en la consigna.

## Documentación de referencia

Este frontend forma parte del **Trabajo Final Integrador de Desarrollo de Aplicaciones Web 2026**, conforme al documento de consignas de la cátedra. La entrega general contempla también la API NestJS, la base PostgreSQL y los requisitos de ejecución con **PM2 y Nginx**, que corresponden al despliegue del sistema completo.
