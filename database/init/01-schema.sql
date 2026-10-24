SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS gestion_escolar
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gestion_escolar;

CREATE TABLE profesores (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  especialidad VARCHAR(100) NULL,
  estatus VARCHAR(20) NOT NULL DEFAULT 'Activo'
);

CREATE TABLE materias (
  id CHAR(36) PRIMARY KEY,
  clave VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  creditos INT NOT NULL,
  profesor_id CHAR(36) NULL,
  FOREIGN KEY (profesor_id) REFERENCES profesores(id) ON DELETE SET NULL
);

CREATE TABLE grupos (
  id CHAR(36) PRIMARY KEY,
  clave VARCHAR(20) NOT NULL,
  semestre INT NOT NULL,
  ciclo_escolar VARCHAR(20) NOT NULL,
  UNIQUE (clave, ciclo_escolar)
);

CREATE TABLE alumnos (
  id CHAR(36) PRIMARY KEY,
  matricula VARCHAR(30) NOT NULL UNIQUE,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL,
  grupo_id CHAR(36) NULL,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL
);

CREATE TABLE grupo_materias (
  grupo_id CHAR(36) NOT NULL,
  materia_id CHAR(36) NOT NULL,
  PRIMARY KEY (grupo_id, materia_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE CASCADE,
  FOREIGN KEY (materia_id) REFERENCES materias(id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
  id CHAR(36) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL
);
