const express = require("express");
let { Record, Appointment } = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");

let router = express.Router();

//GET
router.get("/", (req, res) => {
    Record.find()
        .populate("patient")
        .then((result) => {
            if(result)
                res.status(200).send({ok: true, result: result});
            else 
                res.status(404).send({ok: false, error: "No se encontraron expedientes en el sistema" });
        })
        .catch((error) => {
            res.status(500).send({ok: false, error: "Internal server error"});
        });
});

//GET POR APELLIDO DE PACIENTE
router.get("/find", (req, res) => {
    Patient.find({ surname: req.query.surname })
        .then(resultadoPaciente => {
            let idPacientes = resultadoPaciente.map(p => p.id);
            Record.find({patient: { $in: idPacientes }})
                .populate("patient")
                .then(result => {
                    if(result)
                        res.status(200).send({ok: true, result: result});
                    else 
                        res.status(404).send({ ok: false, error: "No se encontraron expedientes" });
                })
        }).catch((error) => {
            res.status(500).send({ok: false, error: "Internal server error"});
        });
});

//GET POR ID DE PACIENTE
router.get("/:id", (req, res) => {
    Record.find({patient: req.params.id})
        .populate("patient")
        .then(result => {
            if(result)
                res.status(200).send({ ok: true, result: result });
            else 
                res.status(404).send({ ok: false, error: "No se ha encontrado el expediente" });
        }).catch((error) => {
            res.status(500).send({ok: false, error: "Internal server error"});
        });
});

//POST EXPEDIENTE
router.post("/", (req, res) => {
    Patient.findById(req.body.id)
        .then(result => {
            if(result){
                let record = new Record({
                    patient: result.id,
                    medicalRecord: req.body.medicalRecord,
                    appointments: []
                });
                record
                  .save()
                  .then((result) => {
                    res.status(201).send({ ok: true, result: result });
                  })
                  .catch((error) => {
                    res.status(400).send({ ok: false, error: "Error guardando expediente" });
                  });
            }
            else
                res.status(404).send({ok: false, error: "No se ha encontrado paciente con esa ID"});
        }).catch(error => {
            res.status(500).send({ ok: false, error: "Internal server error" });
        })
    
  });

//AÑADIR CONSULTAS A UN EXPEDIENTE
router.post('/:id/appointments', (req, res) => {
    let appointment = new Appointment ({
        date: new Date(req.body.date),
        physio: req.body.physio,
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        observations: req.body.observations
    });
    Record.findByIdAndUpdate(req.params.id, 
    {
        $push: {appointments: appointment} }, {new: true}
    )
    .then(result => {
        if (result)
            res.status(201).send({ ok: true, result: result });
        else
            res.status(404).send({ ok: false, error: "Fallo en la inserción" });
    }).catch(error => {
        res.status(500).send({ok: false, error: "Internal server error"});
    })
})

//DELETE
router.delete("/:id", (req, res) => {
    Record.findByIdAndDelete(req.params.id)
    .populate("patient")
      .then((result) => {
        if (result) res.status(200).send({ ok: true, result: result });
        else
          res.status(404).send({ ok: false, error: "El expediente a eliminar no existe" });
      })
      .catch((error) => {
        res.status(500).send({ ok: false, error: "Internal server error" });
      });
  });

module.exports = router;