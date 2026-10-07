const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
        SELECT
            products.id,
            products.name,
            products.price,
            products.stock,
            products.category_id,
            categories.name AS category
        FROM products
        LEFT JOIN categories
        ON products.category_id = categories.id
        ORDER BY products.id
        `,
        [],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

router.get("/category/:categoryId", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
        SELECT
            products.id,
            products.name,
            products.price,
            products.stock,
            products.category_id,
            categories.name AS category
        FROM products
        LEFT JOIN categories
        ON products.category_id = categories.id
        WHERE products.category_id = ?
        ORDER BY products.id
        `,
        [req.params.categoryId],
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
            products.id,
            products.name,
            products.price,
            products.stock,
            products.category_id,
            categories.name AS category
        FROM products
        LEFT JOIN categories
        ON products.category_id = categories.id
        WHERE products.id = ?
        `,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { name, price, stock, category_id } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            error: "Nombre y precio son obligatorios"
        });
    }

    db.run(
        `
        INSERT INTO products (name, price, stock, category_id)
        VALUES (?, ?, ?, ?)
        `,
        [name, price, stock || 0, category_id || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                id: this.lastID,
                name,
                price,
                stock: stock || 0,
                category_id: category_id || null
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { name, price, stock, category_id } = req.body;

    if (!name || price === undefined) {
        return res.status(400).json({
            error: "Nombre y precio son obligatorios"
        });
    }

    db.run(
        `
        UPDATE products
        SET name = ?, price = ?, stock = ?, category_id = ?
        WHERE id = ?
        `,
        [name, price, stock || 0, category_id || null, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                name,
                price,
                stock: stock || 0,
                category_id: category_id || null
            });
        }
    );
});

router.patch("/:id/price", (req, res) => {
    const db = req.app.locals.db;
    const { price } = req.body;

    if (price === undefined) {
        return res.status(400).json({
            error: "El precio es obligatorio"
        });
    }

    db.run(
        "UPDATE products SET price = ? WHERE id = ?",
        [price, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                price
            });
        }
    );
});

router.patch("/:id/stock", (req, res) => {
    const db = req.app.locals.db;
    const { stock } = req.body;

    if (stock === undefined) {
        return res.status(400).json({
            error: "El stock es obligatorio"
        });
    }

    db.run(
        "UPDATE products SET stock = ? WHERE id = ?",
        [stock, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                stock
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM products WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Producto no encontrado"
                });
            }

            res.json({
                message: "Producto eliminado"
            });
        }
    );
});

module.exports = router;