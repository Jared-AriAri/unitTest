const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        "SELECT * FROM customers ORDER BY id",
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
        "SELECT * FROM customers WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Nombre y email son obligatorios"
        });
    }

    db.run(
        `
    INSERT INTO customers (name, email, phone)
    VALUES (?, ?, ?)
    `,
        [name, email, phone || null],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        error: "El correo ya está registrado"
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                id: this.lastID,
                name,
                email,
                phone: phone || null
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { name, email, phone } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Nombre y email son obligatorios"
        });
    }

    db.run(
        `
    UPDATE customers
    SET name = ?, email = ?, phone = ?
    WHERE id = ?
    `,
        [name, email, phone || null, req.params.id],
        function (err) {
            if (err) {
                if (err.message.includes("UNIQUE")) {
                    return res.status(409).json({
                        error: "El correo ya está registrado"
                    });
                }

                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                name,
                email,
                phone: phone || null
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM customers WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            res.json({
                message: "Cliente eliminado"
            });
        }
    );
});

router.get("/:id/orders", (req, res) => {
    const db = req.app.locals.db;

    db.get(
        "SELECT id FROM customers WHERE id = ?",
        [req.params.id],
        (err, customer) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!customer) {
                return res.status(404).json({
                    error: "Cliente no encontrado"
                });
            }

            db.all(
                `
        SELECT
          id,
          customer_id,
          status,
          total,
          created_at
        FROM orders
        WHERE customer_id = ?
        ORDER BY id DESC
        `,
                [req.params.id],
                (err, rows) => {
                    if (err) return res.status(500).json({ error: err.message });

                    res.json(rows);
                }
            );
        }
    );
});

module.exports = router;