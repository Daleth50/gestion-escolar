SET NAMES utf8mb4;

USE gestion_escolar;

INSERT INTO profesores (id, nombre, correo, especialidad, estatus) VALUES
  ('11111111-1111-4111-8111-111111111111', 'Ana Martínez', 'ana@ejemplo.edu', 'Matemáticas', 'Activo'),
  ('22222222-2222-4222-8222-222222222222', 'Carlos López', 'carlos@ejemplo.edu', 'Informática', 'Activo');

INSERT INTO materias (id, clave, nombre, creditos, profesor_id) VALUES
  ('33333333-3333-4333-8333-333333333333', 'MAT101', 'Matemáticas I', 5, '11111111-1111-4111-8111-111111111111'),
  ('44444444-4444-4444-8444-444444444444', 'INF101', 'Programación I', 6, '22222222-2222-4222-8222-222222222222');

INSERT INTO grupos (id, clave, semestre, ciclo_escolar) VALUES
  ('55555555-5555-4555-8555-555555555555', '1A', 1, '2026-2027');

INSERT INTO grupo_materias (grupo_id, materia_id) VALUES
  ('55555555-5555-4555-8555-555555555555', '33333333-3333-4333-8333-333333333333');
