const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
    SELECT
      reviews.id,
      reviews.product_id,
      products.name AS product,
      reviews.customer_id,
      customers.name AS customer,
      reviews.rating,
      reviews.comment
    FROM reviews
    INNER JOIN products
    ON reviews.product_id = products.id
    INNER JOIN customers
    ON reviews.customer_id = customers.id
    ORDER BY reviews.id DESC
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
      reviews.id,
      reviews.product_id,
      products.name AS product,
      reviews.customer_id,
      customers.name AS customer,
      reviews.rating,
      reviews.comment
    FROM reviews
    INNER JOIN products
    ON reviews.product_id = products.id
    INNER JOIN customers
    ON reviews.customer_id = customers.id
    WHERE reviews.id = ?
    `,
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Reseña no encontrada"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { product_id, customer_id, rating, comment } = req.body;

    if (!product_id || !customer_id || rating === undefined) {
        return res.status(400).json({
            error: "Producto, cliente y calificación son obligatorios"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            error: "La calificación debe estar entre 1 y 5"
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
            INSERT INTO reviews (product_id, customer_id, rating, comment)
            VALUES (?, ?, ?, ?)
            `,
                        [product_id, customer_id, rating, comment || null],
                        function (err) {
                            if (err) return res.status(500).json({ error: err.message });

                            res.status(201).json({
                                id: this.lastID,
                                product_id,
                                customer_id,
                                rating,
                                comment: comment || null
                            });
                        }
                    );
                }
            );
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { rating, comment } = req.body;

    if (rating === undefined) {
        return res.status(400).json({
            error: "La calificación es obligatoria"
        });
    }

    if (rating < 1 || rating > 5) {
        return res.status(400).json({
            error: "La calificación debe estar entre 1 y 5"
        });
    }

    db.run(
        `
    UPDATE reviews
    SET rating = ?, comment = ?
    WHERE id = ?
    `,
        [rating, comment || null, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Reseña no encontrada"
                });
            }

            res.json({
                id: Number(req.params.id),
                rating,
                comment: comment || null
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM reviews WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Reseña no encontrada"
                });
            }

            res.json({
                message: "Reseña eliminada"
            });
        }
    );
});

module.exports = router;