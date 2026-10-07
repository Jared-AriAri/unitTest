const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all("SELECT * FROM categories ORDER BY id", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });

        res.json(rows);
    });
});

router.get("/:id/products", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        `
        SELECT id, name, price, stock, category_id
        FROM products
        WHERE category_id = ?
        ORDER BY id
        `,
        [req.params.id],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });

            res.json(rows);
        }
    );
});

router.get("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.get(
        "SELECT * FROM categories WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "El nombre es obligatorio"
        });
    }

    db.run(
        "INSERT INTO categories (name) VALUES (?)",
        [name],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            res.status(201).json({
                id: this.lastID,
                name
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "El nombre es obligatorio"
        });
    }

    db.run(
        "UPDATE categories SET name = ? WHERE id = ?",
        [name, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            res.json({
                id: Number(req.params.id),
                name
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM categories WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Categoría no encontrada"
                });
            }

            res.json({
                message: "Categoría eliminada"
            });
        }
    );
});

module.exports = router;