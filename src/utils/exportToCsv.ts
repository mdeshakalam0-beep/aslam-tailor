export const exportToCsv = (data: any[], filename: string, columns?: { header: string, key: string }[]) => {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = columns ? columns.map(col => col.header) : Object.keys(data[0]);
  const keys = columns ? columns.map(col => col.key) : Object.keys(data[0]);

  const csvRows = [];
  csvRows.push(headers.join(',')); // Add header row

  for (const row of data) {
    const values = keys.map(key => {
      const value = row[key];
      // Handle nested objects or arrays if necessary, or stringify them
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value).replace(/"/g, '""'); // Escape double quotes for CSV
      }
      return `"${String(value).replace(/"/g, '""')}"`; // Enclose all values in quotes and escape existing quotes
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};