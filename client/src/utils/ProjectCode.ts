export const generateProjectCode = (projectName: string) => {
  const prefix = projectName
    .replace(/[^a-zA-Z]/g, "") // keep only letters
    .toUpperCase()
    .slice(0, 4); // first 4 letters

  const date = new Date();
  const dateStr = date
    .toISOString()
    .slice(2, 10) // 'YY-MM-DD'
    .replace(/-/g, "");

  return `${prefix}-${dateStr}`;
};