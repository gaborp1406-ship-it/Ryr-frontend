import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { IVenta } from './lune.interfaces';
import { fechaCorta } from './formato';

const money = (n: number) => `S/ ${Number(n ?? 0).toFixed(2)}`;

export const descargarVentaPdf = (v: IVenta) => {
  const doc = new jsPDF();
  const margen = 14;

  // Cabecera
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Luné', margen, 20);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Detalle del pedido`, margen, 27);
  doc.setTextColor(0);

  // Datos generales
  const datos: [string, string][] = [
    ['Cliente', v.cliente.nombre],
   
    ['Fecha', fechaCorta(v.fecha)],
   
    [
      'Pago',
      v.pagado
        ? `Pagado${v.metodoPago ? ` por ${v.metodoPago}` : ''}`
        : 'Pendiente',
    ],
  ];
  if (v.notas) datos.push(['Notas', v.notas]);

  autoTable(doc, {
    startY: 34,
    body: datos,
    theme: 'plain',
    styles: { fontSize: 10, cellPadding: 1.5 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 45 } },
  });

  // Productos
  const yTabla = (doc as any).lastAutoTable.finalY + 8;
  autoTable(doc, {
    startY: yTabla,
    head: [['Producto', 'Cant.', 'P. unitario', 'Subtotal']],
    body: v.items.map((i) => [
      i.producto,
      String(i.cantidad),
      money(i.precioUnitario),
      money(i.subtotal),
    ]),
    foot: [['', '', 'TOTAL', money(v.monto)]],
    headStyles: { fillColor: [24, 24, 27] },
    footStyles: { fillColor: [244, 244, 245], textColor: 0, fontStyle: 'bold' },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    styles: { fontSize: 10 },
  });

  doc.save(`pedido-${v.id}.pdf`);
};