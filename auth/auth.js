const jwt = require("jsonwebtoken");

let generarToken = (id, login, rol) => {
  return jwt.sign({ id: id, login: login, rol: rol }, process.env.PALABRA_SECRETA, {
    expiresIn: "10h",
  });
};

let verificarToken = (token) => {
  try {
    let result = jwt.verify(token, process.env.PALABRA_SECRETA);
    return result;
  } catch (error) {}
};

let protegerRuta = (rol) => {
  return (req, res, next) => {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer")) {
        let result = verificarToken(token.slice(7));

        if(result && (rol == "" || rol.some(r => r == result.rol)))
            next();
        else    
            res.status(403)
                .send({ ok: false, error: "Acceso no autorizado 1" });
    }
    else 
        res.send({ ok: false, error: "Usuario no encontrado 1" });
  };
};

let accesoId = (req, res, next) => {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer")) {
        let result = verificarToken(token.slice(7));
        let id= req.params.id;

        if(result && (result.rol == "patient" && id == result.id))
            next();
        else    
            res.status(403)
                .send({ ok: false, error: "Acceso no autorizado 2" });
    }
    else 
        res.send({ ok: false, error: "Usuario no encontrado 2" });
  };

module.exports = {
  generarToken: generarToken,
  verificarToken: verificarToken,
  protegerRuta: protegerRuta,
  accesoId: accesoId
};
