-- Distriboo - Inicialización de base de datos
-- Este archivo se ejecuta automáticamente al crear el contenedor MySQL

CREATE DATABASE IF NOT EXISTS distriboo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON distriboo.* TO 'distriboo_user'@'%';
FLUSH PRIVILEGES;
