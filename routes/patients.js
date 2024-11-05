const express = require("express");
let Patient = require(__dirname + "/../models/patient.js");

let router = express.Router();

//GET
router.get("/", (req, res) => {
  Patient.find()
    .then((result) => {
      if (result) 
        res.status(200).send({ ok: true, result: result });
      else 
        res.status(404).send({ ok: false, error: "No se ha encontrado el paciente" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//GET APELLIDOS
router.get("/find", (req, res) => {
  Patient.find({
    surname: { $regex: req.query.surname, $options: "i" }
  })
    .then((result) => {
      if (result)
        res.status(200).send({ ok: true, result: result });
      else 
        res.status(404).send({ ok: false, error: "No se han encontrado pacientes con esos criterios" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: error });
    });
});

//GET ESPECÍFICO
router.get("/:id", (req, res) => {
  Patient.findById(req.params.id)
    .then((result) => {
      if (result)
        res.status(200).send({ ok: true, result: result });
      else 
        res.status(404).send({ ok: false, error: "No se ha encontrado el paciente" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//POST PACIENTE
router.post("/", (req, res) => {
  let patient = new Patient({
    name: req.body.name,
    surname: req.body.surname,
    birthDate: new Date(req.body.birthDate),
    address: req.body.address,
    insuranceNumber: req.body.insuranceNumber
  });
  patient.save()
    .then((result) => {
      res.status(201).send({ ok: true, result: result });
    })
    .catch((error) => {
      res.status(400).send({ ok: false, error: "Error guardando paciente" });
    });
});

//PUT PACIENTE
router.put("/:id", (req, res) => {
  Patient.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        surname: req.body.surname,
        birthDate: new Date(req.body.birthDate),
        address: req.body.address,
        insuranceNumber: req.body.insuranceNumber,
      }
    },
    { new: true, runValidators: true }
  )
    .then((result) => {
      if (result) res.status(200).send({ ok: true, result: result });
      else
        res.status(400).send({ ok: false, error: "Error actualizando los datos del paciente" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

//DELETE PATIENT
router.delete("/:id", (req, res) => {
  Patient.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (result) res.status(200).send({ ok: true, result: result });
      else
        res.status(404).send({ ok: false, error: "El paciente a eliminar no existe" });
    })
    .catch((error) => {
      res.status(500).send({ ok: false, error: "Internal server error" });
    });
});

module.exports = router;
