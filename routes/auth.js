const express = require('express');
const bcrypt = require('bcrypt');
let User = require(__dirname + '/../models/users.js');
let auth = require(__dirname + '/../auth/auth.js');

let router = express.Router();

//LOGIN
router.post("/login", (req, res) => {
    let login = req.body.login;
    const password = req.body.password;

    User.find()
        .then((result) => {
            if(result){
                let existe = result.filter(u => u.login == login);

                if(existe.length === 1 && bcrypt.compareSync(password, existe[0].password))
                    res.status(200).send({result: auth.generarToken(existe[0]._id, existe[0].login, existe[0].rol)});
                else 
                    res.status(401).send({error: "Usuario o contraseña no válidos"});
            }
        }).catch(() => {})
})

module.exports = router;