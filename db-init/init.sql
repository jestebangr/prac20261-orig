-- AXSO 2026-1 : carga inicial de la base de datos de productos
DROP TABLE IF EXISTS products;
CREATE TABLE products (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    sku         VARCHAR(20)  NOT NULL UNIQUE,
    name        VARCHAR(150) NOT NULL,
    description TEXT,
    category    VARCHAR(50),
    price       DECIMAL(8,2),
    stock       INT,
    rating      DECIMAL(2,1)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

LOAD DATA INFILE '/docker-entrypoint-initdb.d/products-data.csv'
INTO TABLE products
CHARACTER SET utf8mb4
FIELDS TERMINATED BY ';'
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(sku, name, description, category, price, stock, rating);
