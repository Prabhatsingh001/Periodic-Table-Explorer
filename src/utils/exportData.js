export const downloadFile = (content, fileName, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const quoteCsv = (value) => {
  if (value === null || value === undefined) {
    return '""';
  }
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return `"${String(text).replace(/"/g, '""')}"`;
};

export const exportJson = (fileName, data) => {
  const sanitizedFilename = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
  downloadFile(JSON.stringify(data, null, 2), sanitizedFilename, 'application/json;charset=utf-8');
};

export const exportCsv = (fileName, rows, columns) => {
  const sanitizedFilename = fileName.endsWith('.csv') ? fileName : `${fileName}.csv`;
  const headerRow = columns.map((col) => quoteCsv(col.label)).join(',');
  const bodyRows = rows.map((row) =>
    columns
      .map((col) => quoteCsv(typeof col.key === 'function' ? col.key(row) : row[col.key]))
      .join(',')
  );
  const csvContent = [headerRow, ...bodyRows].join('\n');
  downloadFile(csvContent, sanitizedFilename, 'text/csv;charset=utf-8');
};
