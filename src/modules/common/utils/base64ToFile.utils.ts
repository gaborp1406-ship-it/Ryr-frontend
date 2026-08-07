export function base64ToFile(base64String: string, fileName: string) {
  const byteString = atob(base64String.split(',')[1]);

  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: 'image/png' }); // Cambia 'image/png' según el tipo de imagen
  const file = new File([blob], fileName, { type: 'image/png' });

  return file;
}
