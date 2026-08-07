export interface responseListAPI<T> {
  data: T[]; // 'data' es un array de cualquier tipo
  message: string;
  error: string;
  status: number;
}
