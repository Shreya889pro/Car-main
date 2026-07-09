import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';

export const generatePDFReport = async (
  title: string,
  headers: string[],
  rows: (string | number)[][]
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Title
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();

    // Date
    doc.fontSize(10).font('Helvetica').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Table
    const startX = 50;
    const cellPadding = 5;
    const colWidth = (doc.page.width - 100) / headers.length;
    let y = doc.y;

    // Header row
    doc.font('Helvetica-Bold').fontSize(10);
    doc.rect(startX, y, colWidth * headers.length, 25).fill('#2563EB');
    doc.fillColor('#FFFFFF');
    headers.forEach((header, i) => {
      doc.text(header, startX + i * colWidth + cellPadding, y + 7, { width: colWidth - cellPadding * 2 });
    });

    y += 30;
    doc.fillColor('#000000');
    doc.font('Helvetica').fontSize(9);

    // Data rows
    rows.forEach((row) => {
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }

      row.forEach((cell, i) => {
        doc.text(String(cell ?? ''), startX + i * colWidth + cellPadding, y, { width: colWidth - cellPadding * 2 });
      });

      y += 20;
    });

    doc.end();
  });
};

export const generateExcelReport = async (
  title: string,
  headers: string[],
  rows: (string | number | Date)[][]
): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(title);

  // Headers
  const headerRow = worksheet.addRow(headers);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2563EB' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Data rows
  rows.forEach((row) => {
    worksheet.addRow(row);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.values?.forEach((value) => {
      if (value) {
        const length = String(value).length;
        maxLength = Math.max(maxLength, length + 2);
      }
    });
    column.width = Math.min(50, maxLength * 1.2);
  });

  // Border
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
        right: { style: 'thin', color: { argb: 'FFD1D5DB' } },
      };
    });
  });

  return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
};

export default {
  generatePDFReport,
  generateExcelReport,
};
