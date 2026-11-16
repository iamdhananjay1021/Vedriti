/**
 * VedRit Admin CSV Export Utility
 * Handles UTF-8 BOM for flawless Devanagari (Hindi) and English text in MS Excel
 */

export interface CsvColumn<T> {
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
}

export function exportToCsv<T>(filename: string, columns: CsvColumn<T>[], data: T[]) {
  if (!data || !data.length) {
    alert('No data available to export.');
    return;
  }

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerRow = columns.map((c) => escapeCell(c.header)).join(',');
  const dataRows = data.map((row) => columns.map((c) => escapeCell(c.accessor(row))).join(','));

  // Prepend UTF-8 Byte Order Mark (\uFEFF) so Excel opens UTF-8 properly (including Hindi/Devanagari)
  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

