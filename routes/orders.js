const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      orders.id,
      orders.customer_id,
      customers.name AS customer,
      orders.status,
      orders.total,
      orders.created_at
    FROM orders
    INNER JOIN customers
    ON orders.customer_id = customers.id
    ORDER BY orders.id DESC
    `,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

router.get("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.get(
        `
    SELECT
      orders.id,
      orders.customer_id,
      customers.name AS customer,
      orders.status,
      orders.total,
      orders.created_at
    FROM orders
    INNER JOIN customers
    ON orders.customer_id = customers.id
    WHERE orders.id = ?
    `,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Pedido no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { customer_id } = req.body;

    if (!customer_id) {
        return res.status(400).json({
            error: "El cliente es obligatorio"
        });
    }

    db.get(
        "SELECT id FROM customers WHERE id = ?",
        [customer_id],
        (err, customer) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!customer) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            db.run(
                `
        INSERT INTO orders (customer_id, status, total)
        VALUES (?, 'pendiente', 0)
        `,
                [customer_id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    res.status(201).json({
                        id: this.lastID,
                        customer_id,
                        status: "pendiente",
                        total: 0
                    });
                }
            );
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { customer_id } = req.body;

    if (!customer_id) {
        return res.status(400).json({
            error: "El cliente es obligatorio"
        });
    }

    db.get(
        "SELECT id FROM customers WHERE id = ?",
        [customer_id],
        (err, customer) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!customer) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            db.run(
                `
        UPDATE orders
        SET customer_id = ?
        WHERE id = ?
        `,
                [customer_id, req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    if (this.changes === 0) {
                        return res.status(404).json({
                            error: "Pedido no encontrado"
                        });
                    }

                    res.json({
                        id: Number(req.params.id),
                        customer_id
                    });
                }
            );
        }
    );
});

router.patch("/:id/status", (req, res) => {
    const db = req.app.locals.db;
    const { status } = req.body;

    const validStatuses = [
        "pendiente",
        "procesando",
        "enviado",
        "entregado",
        "cancelado"
    ];

    if (!status) {
        return res.status(400).json({
            error: "El estado es obligatorio"
        });
    }

    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            error: "Estado no válido"
        });
    }

    db.run(
        `
    UPDATE orders
    SET status = ?
    WHERE id = ?
    `,
        [status, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Pedido no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                status
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM order_items WHERE order_id = ?",
        [req.params.id],
        err => {
            if (err) return res.status(500).json({ error: err.message });

            db.run(
                "DELETE FROM orders WHERE id = ?",
                [req.params.id],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    if (this.changes === 0) {
                        return res.status(404).json({
                            error: "Pedido no encontrado"
                        });
                    }

                    res.json({
                        message: "Pedido eliminado"
                    });
                }
            );
        }
    );
});

router.get("/:id/items", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      order_items.id,
      order_items.order_id,
      order_items.product_id,
      products.name AS product,
      order_items.quantity,
      order_items.price
    FROM order_items
    INNER JOIN products
    ON order_items.product_id = products.id
    WHERE order_items.order_id = ?
    ORDER BY order_items.id
    `,
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

router.post("/:id/items", (req, res) => {
    const db = req.app.locals.db;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity === undefined || quantity <= 0) {
        return res.status(400).json({
            error: "Producto y cantidad válida son obligatorios"
        });
    }

    db.get(
        "SELECT id FROM orders WHERE id = ?",
        [req.params.id],
        (err, order) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!order) {
                return res.status(404).json({
                    error: "Pedido no encontrado"
                });
            }

            db.get(
                "SELECT id, price, stock FROM products WHERE id = ?",
                [product_id],
                (err, product) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (!product) {
                        return res.status(404).json({
                            error: "Producto no encontrado"
                        });
                    }

                    if (product.stock < quantity) {
                        return res.status(400).json({
                            error: "Stock insuficiente"
                        });
                    }

                    db.run(
                        `
            INSERT INTO order_items (order_id, product_id, quantity, price)
            VALUES (?, ?, ?, ?)
            `,
                        [req.params.id, product_id, quantity, product.price],
                        function (err) {
                            if (err) return res.status(500).json({ error: err.message });

                            const itemId = this.lastID;

                            db.run(
                                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                                [quantity, product_id]
                            );

                            db.run(
                                `
                UPDATE inventory
                SET quantity = quantity - ?
                WHERE product_id = ?
                `,
                                [quantity, product_id]
                            );

                            db.run(
                                `
                UPDATE orders
                SET total = (
                  SELECT COALESCE(SUM(quantity * price), 0)
                  FROM order_items
                  WHERE order_id = ?
                )
                WHERE id = ?
                `,
                                [req.params.id, req.params.id]
                            );

                            res.status(201).json({
                                id: itemId,
                                order_id: Number(req.params.id),
                                product_id,
                                quantity,
                                price: product.price
                            });
                        }
                    );
                }
            );
        }
    );
});

router.put("/:id/items/:itemId", (req, res) => {
    const db = req.app.locals.db;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({
            error: "La cantidad debe ser mayor a 0"
        });
    }

    db.get(
        `
    SELECT *
    FROM order_items
    WHERE id = ? AND order_id = ?
    `,
        [req.params.itemId, req.params.id],
        (err, item) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!item) {
                return res.status(404).json({
                    error: "Producto del pedido no encontrado"
                });
            }

            const difference = quantity - item.quantity;

            db.get(
                "SELECT stock FROM products WHERE id = ?",
                [item.product_id],
                (err, product) => {
                    if (err) return res.status(500).json({ error: err.message });

                    if (difference > 0 && product.stock < difference) {
                        return res.status(400).json({
                            error: "Stock insuficiente"
                        });
                    }

                    db.run(
                        `
            UPDATE order_items
            SET quantity = ?
            WHERE id = ?
            `,
                        [quantity, req.params.itemId],
                        function (err) {
                            if (err) return res.status(500).json({ error: err.message });

                            db.run(
                                `
                UPDATE products
                SET stock = stock - ?
                WHERE id = ?
                `,
                                [difference, item.product_id]
                            );

                            db.run(
                                `
                UPDATE inventory
                SET quantity = quantity - ?
                WHERE product_id = ?
                `,
                                [difference, item.product_id]
                            );

                            db.run(
                                `
                UPDATE orders
                SET total = (
                  SELECT COALESCE(SUM(quantity * price), 0)
                  FROM order_items
                  WHERE order_id = ?
                )
                WHERE id = ?
                `,
                                [req.params.id, req.params.id]
                            );

                            res.json({
                                id: Number(req.params.itemId),
                                order_id: Number(req.params.id),
                                product_id: item.product_id,
                                quantity,
                                price: item.price
                            });
                        }
                    );
                }
            );
        }
    );
});

router.delete("/:id/items/:itemId", (req, res) => {
    const db = req.app.locals.db;

    db.get(
        `
    SELECT *
    FROM order_items
    WHERE id = ? AND order_id = ?
    `,
        [req.params.itemId, req.params.id],
        (err, item) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!item) {
                return res.status(404).json({
                    error: "Producto del pedido no encontrado"
                });
            }

            db.run(
                "DELETE FROM order_items WHERE id = ?",
                [req.params.itemId],
                function (err) {
                    if (err) return res.status(500).json({ error: err.message });

                    db.run(
                        `
            UPDATE products
            SET stock = stock + ?
            WHERE id = ?
            `,
                        [item.quantity, item.product_id]
                    );

                    db.run(
                        `
            UPDATE inventory
            SET quantity = quantity + ?
            WHERE product_id = ?
            `,
                        [item.quantity, item.product_id]
                    );

                    db.run(
                        `
            UPDATE orders
            SET total = (
              SELECT COALESCE(SUM(quantity * price), 0)
              FROM order_items
              WHERE order_id = ?
            )
            WHERE id = ?
            `,
                        [req.params.id, req.params.id]
                    );

                    res.json({
                        message: "Producto eliminado del pedido"
                    });
                }
            );
        }
    );
});

module.exports = router;