export const exportToCSV = (tasks) => {
  const headers = ["Title", "Description", "Status", "Due Date", "Owner Email"].join(",");
  const rows = tasks.map(t => [
    `"${t.title}"`,
    `"${t.description}"`,
    t.status,
    t.dueDate,
    t.ownerEmail || 'N/A'
  ].join(","));

  const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", "tasks_export.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};