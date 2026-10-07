const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    const db = req.app.locals.db;

    db.all(
        "SELECT id, name, email FROM users ORDER BY id",
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
        "SELECT id, name, email FROM users WHERE id = ?",
        [req.params.id],
        (err, row) => {
            if (err) return res.status(500).json({ error: err.message });

            if (!row) {
                return res.status(404).json({
                    error: "Usuario no encontrado"
                });
            }

            res.json(row);
        }
    );
});

router.post("/", (req, res) => {
    const db = req.app.locals.db;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            error: "Nombre, email y contraseña son obligatorios"
        });
    }

    db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
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
                email
            });
        }
    );
});

router.put("/:id", (req, res) => {
    const db = req.app.locals.db;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Nombre y email son obligatorios"
        });
    }

    db.run(
        "UPDATE users SET name = ?, email = ? WHERE id = ?",
        [name, email, req.params.id],
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
                    error: "Usuario no encontrado"
                });
            }

            res.json({
                id: Number(req.params.id),
                name,
                email
            });
        }
    );
});

router.patch("/:id/password", (req, res) => {
    const db = req.app.locals.db;
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({
            error: "La contraseña es obligatoria"
        });
    }

    db.run(
        "UPDATE users SET password = ? WHERE id = ?",
        [password, req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Usuario no encontrado"
                });
            }

            res.json({
                message: "Contraseña actualizada"
            });
        }
    );
});

router.delete("/:id", (req, res) => {
    const db = req.app.locals.db;

    db.run(
        "DELETE FROM users WHERE id = ?",
        [req.params.id],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Usuario no encontrado"
                });
            }

            res.json({
                message: "Usuario eliminado"
            });
        }
    );
});

module.exports = router;