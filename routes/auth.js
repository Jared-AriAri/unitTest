const express = require("express");

const router = express.Router();

router.post("/register", (req, res) => {
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

router.post("/login", (req, res) => {
    const db = req.app.locals.db;
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            error: "Email y contraseña son obligatorios"
        });
    }

    db.get(
        "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, user) => {
            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!user) {
                return res.status(401).json({
                    error: "Credenciales incorrectas"
                });
            }

            res.status(200).json({
                message: "Inicio de sesión correcto",
                user
            });
        }
    );
});

module.exports = router;