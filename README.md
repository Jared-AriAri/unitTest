# unitTest - API REST con CI/CD, Docker y AWS EC2

Proyecto de API REST desarrollado con Node.js, Express y SQLite, orientado a la implementación de pruebas automatizadas, cobertura de código, contenedorización con Docker, integración continua con GitHub Actions y despliegue automático en AWS EC2.

## Descripción

El proyecto implementa una API REST con diferentes módulos para gestionar usuarios, autenticación, categorías, productos, inventario, proveedores, clientes, pedidos y reseñas.

Además de las operaciones CRUD, se implementaron casos reales de validación y manejo de errores, incluyendo registros duplicados, recursos inexistentes, datos obligatorios faltantes, inventario insuficiente, calificaciones inválidas y estados de pedidos incorrectos.

El proyecto cuenta con pruebas automatizadas utilizando Jest y Supertest, cobertura de código superior al 70%, contenedorización mediante Docker, publicación automática de imágenes en Docker Hub y despliegue automático en una instancia EC2 mediante GitHub Actions.

## Tecnologías utilizadas

- Node.js 20
- Express.js
- SQLite
- Jest
- Supertest
- Docker
- Docker Hub
- Git
- GitHub
- GitHub Actions
- AWS EC2
- Ubuntu Linux

## Estructura del proyecto

```text
unitTest/
├── .github/
│   └── workflows/
│       └── main.yml
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── categories.js
│   ├── products.js
│   ├── inventory.js
│   ├── suppliers.js
│   ├── customers.js
│   ├── orders.js
│   └── reviews.js
├── .dockerignore
├── .gitignore
├── Dockerfile
├── app.js
├── package.json
├── package-lock.json
├── server.js
└── testEndpoints.test.js

Módulos de la API
La API está organizada en los siguientes módulos:
- Autenticación
- Usuarios
- Categorías
- Productos
- Inventario
- Proveedores
- Clientes
- Pedidos
- Reseñas
- Estado de la API
El proyecto cuenta con 60 endpoints funcionales entre operaciones GET, POST, PUT, PATCH y DELETE.
Instalación local
Clonar el repositorio:
git clone https://github.com/Jared-AriAri/unitTest.git

Entrar al proyecto:
cd unitTest

Instalar dependencias:
npm install

Ejecutar la API:
npm start

Por defecto, la API se ejecuta en:
http://localhost:3000

Comprobar funcionamiento local
Para comprobar el estado de la API:
curl http://localhost:3000/health

Respuesta esperada:
{
  "status": "ok",
  "message": "API funcionando correctamente"
}

Pruebas automatizadas
Las pruebas fueron desarrolladas utilizando Jest y Supertest.
Ejecutar todas las pruebas:
npm test

Ejecutar pruebas con cobertura:
npm run test:coverage

Resultados de pruebas
Se ejecutaron un total de:
111 pruebas

Resultado:
111 passed
0 failed

La cobertura global obtenida fue:
Statements: 83.28%
Branches:   66.74%
Functions:  100%
Lines:      92.32%

El proyecto supera el requisito mínimo de 70% de cobertura de código en statements, functions y lines.
Casos de prueba considerados
Además de los casos exitosos, se probaron escenarios de error como:
- Datos obligatorios faltantes
- Usuarios duplicados
- Correos duplicados
- Recursos inexistentes
- Categorías inexistentes
- Productos inexistentes
- Inventario duplicado
- Cantidades negativas
- Stock insuficiente
- Proveedores inexistentes
- Clientes inexistentes
- Estados de pedido inválidos
- Calificaciones fuera del rango permitido
- Credenciales incorrectas
- Rutas inexistentes
Docker
El proyecto cuenta con un archivo Dockerfile para construir una imagen de la aplicación.
Construir la imagen:
docker build -t unittest-api .

Ejecutar el contenedor:
docker run -d \
  --name unittest-container \
  -p 8080:80 \
  unittest-api

Comprobar contenedores:
docker ps

Probar la API dentro del contenedor:
curl http://localhost:8080/health

Docker Hub
La imagen se publica en Docker Hub en:
jaredari/unittest-api

La imagen utiliza dos tipos de tags:
latest

y un tag generado con el hash del commit:
github.sha

Ejemplo:
jaredari/unittest-api:latest
jaredari/unittest-api:197006b...

GitHub Actions
El proyecto cuenta con un pipeline de CI/CD ubicado en:
.github/workflows/main.yml

El pipeline se ejecuta cuando se realiza:
push a main
pull_request a main

El proceso automatizado realiza las siguientes etapas:
Git Push
   ↓
Instalación de dependencias
   ↓
Pruebas con Jest
   ↓
Validación de Coverage
   ↓
Construcción de imagen Docker
   ↓
Publicación en Docker Hub
   ↓
Despliegue automático en AWS EC2

El pipeline está dividido en tres jobs principales:
test
docker
deploy

Los tres jobs deben finalizar correctamente para completar el proceso de despliegue.
Secrets de GitHub
Para evitar almacenar credenciales sensibles directamente en el repositorio, se utilizan GitHub Secrets.
Secrets configurados:
DOCKERHUB_USERNAME
DOCKERHUB_TOKEN
EC2_HOST
EC2_USER
EC2_SSH_KEY

Estos valores permiten autenticarse de forma segura con Docker Hub y con la instancia EC2.
AWS EC2
La aplicación fue desplegada en una instancia AWS EC2 con Ubuntu.
Configuración principal:
Sistema operativo: Ubuntu
Tipo de instancia: t3.micro
Arquitectura: x86_64
Docker: instalado
Puerto SSH: 22
Puerto HTTP: 80

El Security Group permite:
SSH   TCP 22
HTTP  TCP 80

URL pública de la API
La API desplegada en AWS EC2 está disponible en:
http://23.20.19.125

Endpoint utilizado para comprobar el funcionamiento:
http://23.20.19.125/health

Prueba mediante terminal:
curl http://23.20.19.125/health

Respuesta:
{
  "status": "ok",
  "message": "API funcionando correctamente"
}

Endpoints principales
Health
GET /health

Autenticación
POST /api/auth/register
POST /api/auth/login

Usuarios
GET /api/users
GET /api/users/:id
POST /api/users
PUT /api/users/:id
PATCH /api/users/:id/password
DELETE /api/users/:id

Categorías
GET /api/categories
GET /api/categories/:id
GET /api/categories/:id/products
POST /api/categories
PUT /api/categories/:id
DELETE /api/categories/:id

Productos
GET /api/products
GET /api/products/:id
GET /api/products/category/:categoryId
POST /api/products
PUT /api/products/:id
PATCH /api/products/:id/price
PATCH /api/products/:id/stock
DELETE /api/products/:id

Inventario
GET /api/inventory
GET /api/inventory/low-stock
GET /api/inventory/:productId
POST /api/inventory
PUT /api/inventory/:productId
POST /api/inventory/:productId/increase
POST /api/inventory/:productId/decrease
DELETE /api/inventory/:productId

Proveedores
GET /api/suppliers
GET /api/suppliers/:id
GET /api/suppliers/:id/products
POST /api/suppliers
POST /api/suppliers/:id/products
PUT /api/suppliers/:id
DELETE /api/suppliers/:id
DELETE /api/suppliers/:id/products/:productId

Clientes
GET /api/customers
GET /api/customers/:id
GET /api/customers/:id/orders
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id

Pedidos
GET /api/orders
GET /api/orders/:id
GET /api/orders/:id/items
POST /api/orders
POST /api/orders/:id/items
PUT /api/orders/:id
PUT /api/orders/:id/items/:itemId
PATCH /api/orders/:id/status
DELETE /api/orders/:id
DELETE /api/orders/:id/items/:itemId

Reseñas
GET /api/reviews
GET /api/reviews/:id
POST /api/reviews
PUT /api/reviews/:id
DELETE /api/reviews/:id

Flujo de despliegue
Cada vez que se realiza un cambio y se ejecuta:
git add .
git commit -m "Descripción del cambio"
git push origin main

GitHub Actions ejecuta automáticamente:
1. Instalación de dependencias.
2. Ejecución de pruebas.
3. Validación de cobertura.
4. Construcción de la imagen Docker.
5. Publicación del tag latest.
6. Publicación del tag correspondiente al hash del commit.
7. Conexión mediante SSH a AWS EC2.
8. Descarga de la nueva imagen.
9. Eliminación del contenedor anterior.
10. Creación del nuevo contenedor.
11. Publicación de la API mediante el puerto 80.
Resultado final
El proyecto implementa un flujo completo de integración y despliegue continuo.
Se logró integrar:
API REST
+
Pruebas automatizadas
+
Coverage
+
Docker
+
Docker Hub
+
GitHub Actions
+
AWS EC2

El resultado final permite modificar el código, realizar un git push y desplegar automáticamente una nueva versión de la aplicación en AWS EC2 siempre que las pruebas se ejecuten correctamente.
Repositorio
GitHub:
https://github.com/Jared-AriAri/unitTest

Docker Hub:
jaredari/unittest-api

Autor
Jared Ariel González Espejel