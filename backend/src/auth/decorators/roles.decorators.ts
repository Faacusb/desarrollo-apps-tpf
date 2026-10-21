import { SetMetadata } from "@nestjs/common";
import { RolesUsuarioEnum } from "../../common/enums/roles.enum.js";

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolesUsuarioEnum[]) => SetMetadata(ROLES_KEY, roles);