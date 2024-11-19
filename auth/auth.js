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
            res.status(403).send({ error: "Acceso no autorizado" });
    }
    else 
        res.status(404).send({ error: "Usuario no encontrado" });
  };
};

let accesoId = () => {
 return (req, res, next) => {
    let token = req.headers["authorization"];
    if (token && token.startsWith("Bearer")) {
        let result = verificarToken(token.slice(7));
        let id= req.params.id;

        if(!result || (result.rol == "patient" && id != result.id))
          res.status(403).send({ error: "Acceso no autorizado" });
        else    
          next();
    }
    else 
        res.status(404).send({ error: "Usuario no encontrado" });
  };
}

module.exports = {
  generarToken: generarToken,
  verificarToken: verificarToken,
  protegerRuta: protegerRuta,
  accesoId: accesoId
};
