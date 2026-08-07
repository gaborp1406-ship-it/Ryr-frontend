// interfaces/auth-checkStatus.interface.ts
export interface AuthCheckStatus {
  idusuario: number;
  usuario: string;
  roles: Roles[];
  permisos: Permiso[];
  id_trabajador: number;
  nrodocumento: string;
  nombre_trabajador: string;
  apellido_trabajador: string;
  celular: string;
  correo: string;
  token: string;
}

export interface Permiso {
  id: number;
  nombre: string;
  icono: string | null;
  subMenu: SubMenu[];
}

export interface SubMenu {
  id: number;
  nombre: string;
  url: string;
}

export interface Roles {
  idrol: number;
}