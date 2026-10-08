const request = require("supertest");
const app = require("./app");

const id = Date.now();

const userEmail = `usuario${id}@test.com`;
const secondUserEmail = `usuario2${id}@test.com`;
const customerEmail = `cliente${id}@test.com`;

let userId;
let categoryId;
let productId;
let inventoryProductId;
let supplierId;
let customerId;
let orderId;
let orderItemId;
let reviewId;

describe("API REST completa", () => {
    test("GET /health", async () => {
        const res = await request(app).get("/health");

        expect(res.statusCode).toBe(200);
        expect(res.body.status).toBe("ok ret");
    });

    test("GET ruta inexistente", async () => {
        const res = await request(app).get("/api/no-existe");

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/auth/register", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Jared",
                email: userEmail,
                password: "123456"
            });

        expect(res.statusCode).toBe(201);
        expect(res.body.email).toBe(userEmail);

        userId = res.body.id;
    });

    test("POST /api/auth/register sin datos", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/auth/register correo duplicado", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Jared",
                email: userEmail,
                password: "123456"
            });

        expect(res.statusCode).toBe(409);
    });

    test("POST /api/auth/login", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userEmail,
                password: "123456"
            });

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/auth/login sin contraseña", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userEmail
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/auth/login incorrecto", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({
                email: userEmail,
                password: "incorrecta"
            });

        expect(res.statusCode).toBe(401);
    });

    test("GET /api/users", async () => {
        const res = await request(app).get("/api/users");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/users/:id", async () => {
        const res = await request(app).get(`/api/users/${userId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.id).toBe(userId);
    });

    test("GET /api/users/:id inexistente", async () => {
        const res = await request(app).get("/api/users/999999");

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/users", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({
                name: "Usuario Dos",
                email: secondUserEmail,
                password: "abcdef"
            });

        expect(res.statusCode).toBe(201);
    });

    test("POST /api/users sin datos", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/users correo duplicado", async () => {
        const res = await request(app)
            .post("/api/users")
            .send({
                name: "Duplicado",
                email: secondUserEmail,
                password: "123"
            });

        expect(res.statusCode).toBe(409);
    });

    test("PUT /api/users/:id", async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .send({
                name: "Jared Actualizado",
                email: userEmail
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/users/:id sin datos", async () => {
        const res = await request(app)
            .put(`/api/users/${userId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("PUT /api/users/:id inexistente", async () => {
        const res = await request(app)
            .put("/api/users/999999")
            .send({
                name: "No existe",
                email: `no${id}@test.com`
            });

        expect(res.statusCode).toBe(404);
    });

    test("PATCH /api/users/:id/password", async () => {
        const res = await request(app)
            .patch(`/api/users/${userId}/password`)
            .send({
                password: "654321"
            });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH /api/users/:id/password sin password", async () => {
        const res = await request(app)
            .patch(`/api/users/${userId}/password`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("PATCH /api/users/:id/password inexistente", async () => {
        const res = await request(app)
            .patch("/api/users/999999/password")
            .send({
                password: "123456"
            });

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/categories", async () => {
        const res = await request(app)
            .post("/api/categories")
            .send({
                name: `Electrónica ${id}`
            });

        expect(res.statusCode).toBe(201);

        categoryId = res.body.id;
    });

    test("POST /api/categories sin nombre", async () => {
        const res = await request(app)
            .post("/api/categories")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("GET /api/categories", async () => {
        const res = await request(app).get("/api/categories");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/categories/:id", async () => {
        const res = await request(app)
            .get(`/api/categories/${categoryId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/categories/:id inexistente", async () => {
        const res = await request(app)
            .get("/api/categories/999999");

        expect(res.statusCode).toBe(404);
    });

    test("GET /api/categories/:id/products", async () => {
        const res = await request(app)
            .get(`/api/categories/${categoryId}/products`);

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("PUT /api/categories/:id", async () => {
        const res = await request(app)
            .put(`/api/categories/${categoryId}`)
            .send({
                name: `Tecnología ${id}`
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/categories/:id sin nombre", async () => {
        const res = await request(app)
            .put(`/api/categories/${categoryId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("PUT /api/categories inexistente", async () => {
        const res = await request(app)
            .put("/api/categories/999999")
            .send({
                name: "Inexistente"
            });

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/products", async () => {
        const res = await request(app)
            .post("/api/products")
            .send({
                name: `Laptop ${id}`,
                price: 15000,
                stock: 20,
                category_id: categoryId
            });

        expect(res.statusCode).toBe(201);

        productId = res.body.id;
        inventoryProductId = res.body.id;
    });

    test("POST /api/products sin nombre", async () => {
        const res = await request(app)
            .post("/api/products")
            .send({
                price: 100
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/products sin precio", async () => {
        const res = await request(app)
            .post("/api/products")
            .send({
                name: "Sin precio"
            });

        expect(res.statusCode).toBe(400);
    });

    test("GET /api/products", async () => {
        const res = await request(app).get("/api/products");

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test("GET /api/products/:id", async () => {
        const res = await request(app)
            .get(`/api/products/${productId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/products/:id inexistente", async () => {
        const res = await request(app)
            .get("/api/products/999999");

        expect(res.statusCode).toBe(404);
    });

    test("GET /api/products/category/:categoryId", async () => {
        const res = await request(app)
            .get(`/api/products/category/${categoryId}`);

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/products/:id", async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .send({
                name: `Laptop Pro ${id}`,
                price: 17000,
                stock: 20,
                category_id: categoryId
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/products/:id sin datos", async () => {
        const res = await request(app)
            .put(`/api/products/${productId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("PUT /api/products inexistente", async () => {
        const res = await request(app)
            .put("/api/products/999999")
            .send({
                name: "No existe",
                price: 10
            });

        expect(res.statusCode).toBe(404);
    });

    test("PATCH /api/products/:id/price", async () => {
        const res = await request(app)
            .patch(`/api/products/${productId}/price`)
            .send({
                price: 18000
            });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH /api/products/:id/price sin precio", async () => {
        const res = await request(app)
            .patch(`/api/products/${productId}/price`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("PATCH /api/products/:id/stock", async () => {
        const res = await request(app)
            .patch(`/api/products/${productId}/stock`)
            .send({
                stock: 20
            });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH /api/products/:id/stock sin stock", async () => {
        const res = await request(app)
            .patch(`/api/products/${productId}/stock`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/inventory", async () => {
        const res = await request(app)
            .post("/api/inventory")
            .send({
                product_id: inventoryProductId,
                quantity: 20
            });

        expect(res.statusCode).toBe(201);
    });

    test("POST /api/inventory sin datos", async () => {
        const res = await request(app)
            .post("/api/inventory")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/inventory cantidad negativa", async () => {
        const res = await request(app)
            .post("/api/inventory")
            .send({
                product_id: productId,
                quantity: -1
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/inventory producto inexistente", async () => {
        const res = await request(app)
            .post("/api/inventory")
            .send({
                product_id: 999999,
                quantity: 10
            });

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/inventory duplicado", async () => {
        const res = await request(app)
            .post("/api/inventory")
            .send({
                product_id: inventoryProductId,
                quantity: 20
            });

        expect(res.statusCode).toBe(409);
    });

    test("GET /api/inventory", async () => {
        const res = await request(app).get("/api/inventory");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/inventory/low-stock", async () => {
        const res = await request(app)
            .get("/api/inventory/low-stock");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/inventory/:productId", async () => {
        const res = await request(app)
            .get(`/api/inventory/${inventoryProductId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/inventory inexistente", async () => {
        const res = await request(app)
            .get("/api/inventory/999999");

        expect(res.statusCode).toBe(404);
    });

    test("PUT /api/inventory/:productId", async () => {
        const res = await request(app)
            .put(`/api/inventory/${inventoryProductId}`)
            .send({
                quantity: 15
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/inventory cantidad negativa", async () => {
        const res = await request(app)
            .put(`/api/inventory/${inventoryProductId}`)
            .send({
                quantity: -10
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/inventory/:productId/increase", async () => {
        const res = await request(app)
            .post(`/api/inventory/${inventoryProductId}/increase`)
            .send({
                quantity: 5
            });

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/inventory increase inválido", async () => {
        const res = await request(app)
            .post(`/api/inventory/${inventoryProductId}/increase`)
            .send({
                quantity: 0
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/inventory/:productId/decrease", async () => {
        const res = await request(app)
            .post(`/api/inventory/${inventoryProductId}/decrease`)
            .send({
                quantity: 2
            });

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/inventory decrease stock insuficiente", async () => {
        const res = await request(app)
            .post(`/api/inventory/${inventoryProductId}/decrease`)
            .send({
                quantity: 999999
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/suppliers", async () => {
        const res = await request(app)
            .post("/api/suppliers")
            .send({
                name: `Proveedor ${id}`,
                email: `proveedor${id}@test.com`,
                phone: "4421234567"
            });

        expect(res.statusCode).toBe(201);

        supplierId = res.body.id;
    });

    test("POST /api/suppliers sin nombre", async () => {
        const res = await request(app)
            .post("/api/suppliers")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("GET /api/suppliers", async () => {
        const res = await request(app).get("/api/suppliers");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/suppliers/:id", async () => {
        const res = await request(app)
            .get(`/api/suppliers/${supplierId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/suppliers inexistente", async () => {
        const res = await request(app)
            .get("/api/suppliers/999999");

        expect(res.statusCode).toBe(404);
    });

    test("PUT /api/suppliers/:id", async () => {
        const res = await request(app)
            .put(`/api/suppliers/${supplierId}`)
            .send({
                name: `Proveedor Actualizado ${id}`,
                email: `proveedor${id}@test.com`,
                phone: "4420000000"
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/suppliers sin nombre", async () => {
        const res = await request(app)
            .put(`/api/suppliers/${supplierId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/suppliers/:id/products", async () => {
        const res = await request(app)
            .post(`/api/suppliers/${supplierId}/products`)
            .send({
                product_id: productId
            });

        expect(res.statusCode).toBe(201);
    });

    test("POST proveedor producto duplicado", async () => {
        const res = await request(app)
            .post(`/api/suppliers/${supplierId}/products`)
            .send({
                product_id: productId
            });

        expect(res.statusCode).toBe(409);
    });

    test("GET /api/suppliers/:id/products", async () => {
        const res = await request(app)
            .get(`/api/suppliers/${supplierId}/products`);

        expect(res.statusCode).toBe(200);
    });

    test("POST /api/customers", async () => {
        const res = await request(app)
            .post("/api/customers")
            .send({
                name: `Cliente ${id}`,
                email: customerEmail,
                phone: "4421112233"
            });

        expect(res.statusCode).toBe(201);

        customerId = res.body.id;
    });

    test("POST /api/customers sin datos", async () => {
        const res = await request(app)
            .post("/api/customers")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/customers duplicado", async () => {
        const res = await request(app)
            .post("/api/customers")
            .send({
                name: "Duplicado",
                email: customerEmail
            });

        expect(res.statusCode).toBe(409);
    });

    test("GET /api/customers", async () => {
        const res = await request(app).get("/api/customers");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/customers/:id", async () => {
        const res = await request(app)
            .get(`/api/customers/${customerId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/customers inexistente", async () => {
        const res = await request(app)
            .get("/api/customers/999999");

        expect(res.statusCode).toBe(404);
    });

    test("PUT /api/customers/:id", async () => {
        const res = await request(app)
            .put(`/api/customers/${customerId}`)
            .send({
                name: `Cliente Actualizado ${id}`,
                email: customerEmail,
                phone: "4429999999"
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/customers sin datos", async () => {
        const res = await request(app)
            .put(`/api/customers/${customerId}`)
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/orders", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({
                customer_id: customerId
            });

        expect(res.statusCode).toBe(201);

        orderId = res.body.id;
    });

    test("POST /api/orders sin cliente", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/orders cliente inexistente", async () => {
        const res = await request(app)
            .post("/api/orders")
            .send({
                customer_id: 999999
            });

        expect(res.statusCode).toBe(404);
    });

    test("GET /api/orders", async () => {
        const res = await request(app).get("/api/orders");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/orders/:id", async () => {
        const res = await request(app)
            .get(`/api/orders/${orderId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/orders inexistente", async () => {
        const res = await request(app)
            .get("/api/orders/999999");

        expect(res.statusCode).toBe(404);
    });

    test("GET /api/customers/:id/orders", async () => {
        const res = await request(app)
            .get(`/api/customers/${customerId}/orders`);

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/orders/:id", async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}`)
            .send({
                customer_id: customerId
            });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH /api/orders/:id/status", async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .send({
                status: "procesando"
            });

        expect(res.statusCode).toBe(200);
    });

    test("PATCH pedido estado inválido", async () => {
        const res = await request(app)
            .patch(`/api/orders/${orderId}/status`)
            .send({
                status: "inventado"
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/orders/:id/items", async () => {
        const res = await request(app)
            .post(`/api/orders/${orderId}/items`)
            .send({
                product_id: productId,
                quantity: 2
            });

        expect(res.statusCode).toBe(201);

        orderItemId = res.body.id;
    });

    test("POST pedido item cantidad inválida", async () => {
        const res = await request(app)
            .post(`/api/orders/${orderId}/items`)
            .send({
                product_id: productId,
                quantity: 0
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST pedido item stock insuficiente", async () => {
        const res = await request(app)
            .post(`/api/orders/${orderId}/items`)
            .send({
                product_id: productId,
                quantity: 999999
            });

        expect(res.statusCode).toBe(400);
    });

    test("GET /api/orders/:id/items", async () => {
        const res = await request(app)
            .get(`/api/orders/${orderId}/items`);

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/orders/:id/items/:itemId", async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/items/${orderItemId}`)
            .send({
                quantity: 3
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT pedido item inexistente", async () => {
        const res = await request(app)
            .put(`/api/orders/${orderId}/items/999999`)
            .send({
                quantity: 2
            });

        expect(res.statusCode).toBe(404);
    });

    test("POST /api/reviews", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .send({
                product_id: productId,
                customer_id: customerId,
                rating: 5,
                comment: "Excelente producto"
            });

        expect(res.statusCode).toBe(201);

        reviewId = res.body.id;
    });

    test("POST /api/reviews sin datos", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .send({});

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/reviews rating inválido", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .send({
                product_id: productId,
                customer_id: customerId,
                rating: 10
            });

        expect(res.statusCode).toBe(400);
    });

    test("POST /api/reviews producto inexistente", async () => {
        const res = await request(app)
            .post("/api/reviews")
            .send({
                product_id: 999999,
                customer_id: customerId,
                rating: 5
            });

        expect(res.statusCode).toBe(404);
    });

    test("GET /api/reviews", async () => {
        const res = await request(app).get("/api/reviews");

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/reviews/:id", async () => {
        const res = await request(app)
            .get(`/api/reviews/${reviewId}`);

        expect(res.statusCode).toBe(200);
    });

    test("GET /api/reviews inexistente", async () => {
        const res = await request(app)
            .get("/api/reviews/999999");

        expect(res.statusCode).toBe(404);
    });

    test("PUT /api/reviews/:id", async () => {
        const res = await request(app)
            .put(`/api/reviews/${reviewId}`)
            .send({
                rating: 4,
                comment: "Muy buen producto"
            });

        expect(res.statusCode).toBe(200);
    });

    test("PUT /api/reviews rating inválido", async () => {
        const res = await request(app)
            .put(`/api/reviews/${reviewId}`)
            .send({
                rating: 8
            });

        expect(res.statusCode).toBe(400);
    });

    test("DELETE /api/reviews/:id", async () => {
        const res = await request(app)
            .delete(`/api/reviews/${reviewId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/orders/:id/items/:itemId", async () => {
        const res = await request(app)
            .delete(`/api/orders/${orderId}/items/${orderItemId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/orders/:id", async () => {
        const res = await request(app)
            .delete(`/api/orders/${orderId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/suppliers/:id/products/:productId", async () => {
        const res = await request(app)
            .delete(`/api/suppliers/${supplierId}/products/${productId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/suppliers/:id", async () => {
        const res = await request(app)
            .delete(`/api/suppliers/${supplierId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/inventory/:productId", async () => {
        const res = await request(app)
            .delete(`/api/inventory/${inventoryProductId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/products/:id", async () => {
        const res = await request(app)
            .delete(`/api/products/${productId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/categories/:id", async () => {
        const res = await request(app)
            .delete(`/api/categories/${categoryId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/customers/:id", async () => {
        const res = await request(app)
            .delete(`/api/customers/${customerId}`);

        expect(res.statusCode).toBe(200);
    });

    test("DELETE /api/users/:id", async () => {
        const res = await request(app)
            .delete(`/api/users/${userId}`);

        expect(res.statusCode).toBe(200);
    });
});