const express = require("express");
let Physio = require(__dirname + "/../models/physio.js");

let router = express.Router();

//GET
router.get("/", (req, res) => {
  Physio.find()
    .then((result) => {
      if (result) 
        res.status(200).send({ ok: true, result: result });
      else 
        res.status(404).send({ ok: false, error: "No hay fisios en el sistema" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//GET ESPECIALIDAD
router.get("/find", (req, res) => {
  Physio.find({ specialty: req.query.specialty })
    .then((result) => {
      if (result) 
        res.status(200).send({ ok: true, result: result });
       else 
        res.status(404).send({ ok: false, error: "No se han encontrado fisios con esos criterios" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//GET ESPECÍFICO
router.get("/:id", (req, res) => {
  Physio.findById(req.params.id)
    .then((result) => {
      if (result)
        res.status(200).send({ ok: true, result: result });
      else 
        res.status(404).send({ ok: false, error: "El fisio no se ha encontrado" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//POST FISIO
router.post("/", (req, res) => {
  let physio = new Physio({
    name: req.body.name,
    surname: req.body.surname,
    specialty: req.body.specialty,
    licenseNumber: req.body.licenseNumber
  });
  physio.save()
    .then((result) => {
      res.status(201).send({ ok: true, result: result });
    })
    .catch((error) => {
      res.status(400).send({ ok: false, error: "Error guardando fisio" });
    });
});

//PUT FISIO
router.put("/:id", (req, res) => {
  Physio.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        surname: req.body.surname,
        specialty: req.body.specialty,
        licenseNumber: req.body.licenseNumber,
      }
    },
    { new: true, runValidators: true }
  )
    .then((result) => {
      if (result) res.status(200).send({ ok: true, result: result });
      else
        res.status(400).send({ ok: false, error: "Error actualizando los datos del fisio" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//DELETE FISIO
router.delete("/:id", (req, res) => {
  Physio.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) res.status(200).send({ ok: true, result: result });
      else
        res.status(404).send({ ok: false, error: "El fisio a eliminar no existe" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

module.exports = router;
