INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(),
  'admin@skillfix.com',
  '$2b$10$d.vynjNtkCe3lP2BBu5WvOeC/K3b/aGwsfArt6GAJ2bBLeraxXPTa',
  'Administrador',
  'master',
  true,
  NOW(),
  NOW()
);
