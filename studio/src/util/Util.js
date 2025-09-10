export function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getRoles() {
  return {
    1: "User",
    2: "Viewer",
    3: "Writer",
    5: "Admin",
  };
}

export function getRolesWithLabels() {
  return [
    { label: "Admin", value: 5 },
    { label: "Writer", value: 3 },
    { label: "Viewer", value: 2 },
    { label: "User", value: 1 },
  ];
}