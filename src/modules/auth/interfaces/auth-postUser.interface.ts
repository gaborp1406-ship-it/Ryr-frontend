// Definir la interfaz para el objeto 'user'
export interface AuthPostUser {
  id: number | null;
  idTrabajador: number | null;
  username: string;
  password: string;
  roles: Rol[]; // 'roles' será un array de objetos tipo 'Rol'
}

// Definir la interfaz para 'roles'
interface Rol {
  idRol: number;
  nombre: string;
  estado: number;
}
