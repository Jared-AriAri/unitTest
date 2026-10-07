const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      inventory.id,
      inventory.product_id,
      products.name AS product,
      inventory.quantity
    FROM inventory
    INNER JOIN products
    ON inventory.product_id = products.id
    ORDER BY inventory.id
    `,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

router.get("/low-stock", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      inventory.id,
      inventory.product_id,
      products.name AS product,
      inventory.quantity
    FROM inventory
    INNER JOIN products
    ON inventory.product_id = products.id
    WHERE inventory.quantity <= 5
    ORDER BY inventory.quantity
    `,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

router.get("/:productId", (req, res) => {
    const db = req.app.locals.db;

    db.get(
        `
    SELECT
      inventory.id,
      inventory.product_id,
      products.name AS product,
      inventory.quantity
    FROM inventory
    INNER JOIN products
    ON inventory.product_id = products.id
    WHERE inventory.product_id = ?
    `,
        [req.params.productId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Inventario no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { product_id, quantity } = req.body;

    if (!product_id || quantity === undefined) {
        return res.status(400).json({
            error: "Producto y cantidad son obligatorios"
        });
    }

    if (quantity < 0) {
        return res.status(400).json({
            error: "La cantidad no puede ser negativa"
        });
    }

    db.get(
        "SELECT id FROM products WHERE id = ?",
        [product_id],
        (err, product) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!product) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            db.run(
                `
        INSERT INTO inventory (product_id, quantity)
        VALUES (?, ?)
        `,
                [product_id, quantity],
                function (err) {
                    if (err) {
                        if (err.message.includes("UNIQUE")) {
                            return res.status(409).json({
                                error: "El producto ya tiene un registro de inventario"
                            });
                        }

                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    db.run(
                        "UPDATE products SET stock = ? WHERE id = ?",
                        [quantity, product_id]
                    );

                    res.status(201).json({
                        id: this.lastID,
                        product_id,
                        quantity
                    });
                }
            );
        }
    );
});

router.put("/:productId", (req, res) => {
    const db = req.app.locals.db;
    const { quantity } = req.body;

    if (quantity === undefined) {
        return res.status(400).json({
            error: "La cantidad es obligatoria"
        });
    }

    if (quantity < 0) {
        return res.status(400).json({
            error: "La cantidad no puede ser negativa"
        });
    }

    db.run(
        `
    UPDATE inventory
    SET quantity = ?
    WHERE product_id = ?
    `,
        [quantity, req.params.productId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Inventario no encontrado"
                });
            }

            db.run(
                "UPDATE products SET stock = ? WHERE id = ?",
                [quantity, req.params.productId]
            );

            res.json({
                product_id: Number(req.params.productId),
                quantity
            });
        }
    );
});

router.post("/:productId/increase", (req, res) => {
    const db = req.app.locals.db;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({
            error: "La cantidad debe ser mayor a 0"
        });
    }

    db.run(
        `
    UPDATE inventory
    SET quantity = quantity + ?
    WHERE product_id = ?
    `,
        [quantity, req.params.productId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Inventario no encontrado"
                });
            }

            db.get(
                "SELECT quantity FROM inventory WHERE product_id = ?",
                [req.params.productId],
                (err, row) => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.run(
                        "UPDATE products SET stock = ? WHERE id = ?",
                        [row.quantity, req.params.productId]
                    );

                    res.json({
                        product_id: Number(req.params.productId),
                        quantity: row.quantity
                    });
                }
            );
        }
    );
});

router.post("/:productId/decrease", (req, res) => {
    const db = req.app.locals.db;
    const { quantity } = req.body;

    if (quantity === undefined || quantity <= 0) {
        return res.status(400).json({
            error: "La cantidad debe ser mayor a 0"
        });
    }

    db.get(
        "SELECT quantity FROM inventory WHERE product_id = ?",
        [req.params.productId],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Inventario no encontrado"
                });
            }

            if (row.quantity < quantity) {
                return res.status(400).json({
                    error: "Stock insuficiente"
                });
            }

            const newQuantity = row.quantity - quantity;

            db.run(
                `
        UPDATE inventory
        SET quantity = ?
        WHERE product_id = ?
        `,
                [newQuantity, req.params.productId],
                err => {
                    if (err) return res.status(500).json({ error: err.message });

                    db.run(
                        "UPDATE products SET stock = ? WHERE id = ?",
                        [newQuantity, req.params.productId]
                    );

                    res.json({
                        product_id: Number(req.params.productId),
                        quantity: newQuantity
                    });
                }
            );
        }
    );
});

router.delete("/:productId", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM inventory WHERE product_id = ?",
        [req.params.productId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Inventario no encontrado"
                });
            }

            db.run(
                "UPDATE products SET stock = 0 WHERE id = ?",
                [req.params.productId]
            );

            res.json({
                message: "Inventario eliminado"
            });
        }
    );
});

module.exports = router;