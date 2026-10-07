const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        "SELECT * FROM suppliers ORDER BY id",
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
        "SELECT * FROM suppliers WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Proveedor no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "El nombre es obligatorio"
        });
    }

    db.run(
        `
    INSERT INTO suppliers (name, email, phone)
    VALUES (?, ?, ?)
    `,
        [name, email || null, phone || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                id: this.lastID,
                name,
                email: email || null,
                phone: phone || null
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "El nombre es obligatorio"
        });
    }

    db.run(
        `
    UPDATE suppliers
    SET name = ?, email = ?, phone = ?
    WHERE id = ?
    `,
        [name, email || null, phone || null, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Proveedor no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                name,
                email: email || null,
                phone: phone || null
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM suppliers WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Proveedor no encontrado"
                });
            }

            db.run(
                "DELETE FROM supplier_products WHERE supplier_id = ?",
                [req.params.id]
            );

            res.json({
                message: "Proveedor eliminado"
            });
        }
    );
});

router.get("/:id/products", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      products.id,
      products.name,
      products.price,
      products.stock,
      products.category_id
    FROM supplier_products
    INNER JOIN products
    ON supplier_products.product_id = products.id
    WHERE supplier_products.supplier_id = ?
    ORDER BY products.id
    `,
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

router.post("/:id/products", (req, res) => {
    const db = req.app.locals.db;
    const { product_id } = req.body;

    if (!product_id) {
        return res.status(400).json({
            error: "El producto es obligatorio"
        });
    }

    db.get(
        "SELECT id FROM suppliers WHERE id = ?",
        [req.params.id],
        (err, supplier) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!supplier) {
                return res.status(404).json({
                    error: "Proveedor no encontrado"
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
            INSERT INTO supplier_products (supplier_id, product_id)
            VALUES (?, ?)
            `,
                        [req.params.id, product_id],
                        function (err) {
                            if (err) {
                                if (err.message.includes("UNIQUE")) {
                                    return res.status(409).json({
                                        error: "El producto ya está asociado al proveedor"
                                    });
                                }

                                return res.status(500).json({
                                    error: err.message
                                });
                            }

                            res.status(201).json({
                                supplier_id: Number(req.params.id),
                                product_id
                            });
                        }
                    );
                }
            );
        }
    );
});

router.delete("/:id/products/:productId", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        `
    DELETE FROM supplier_products
    WHERE supplier_id = ? AND product_id = ?
    `,
        [req.params.id, req.params.productId],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Relación proveedor-producto no encontrada"
                });
            }

            res.json({
                message: "Producto eliminado del proveedor"
            });
        }
    );
});

module.exports = router;