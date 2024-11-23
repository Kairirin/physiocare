const express = require("express");
let { Record, Appointment } = require(__dirname + "/../models/record.js");
let Patient = require(__dirname + "/../models/patient.js");
const { protegerRuta, accesoId } = require("../auth/auth");

let router = express.Router();

//GET
router.get("/", protegerRuta(["admin", "physio"]), (req, res) => {
    Record.find()
        .populate("patient")
        .then((result) => {
            if(result)
                res.status(200).send({ result: result});
            else 
                res.status(404).send({ error: "No se encontraron expedientes en el sistema" });
        })
        .catch((error) => {
            res.status(500).send({ error: "Internal server error"});
        });
});

//GET POR APELLIDO DE PACIENTE
router.get("/find", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.find({ surname: req.query.surname })
        .then(resultadoPaciente => {
            let idPacientes = resultadoPaciente.map(p => p.id);
            Record.find({patient: { $in: idPacientes }})
                .populate("patient")
                .then(result => {
                    if(result)
                        res.status(200).send({ result: result});
                    else 
                        res.status(404).send({ error: "No se encontraron expedientes" });
                })
        }).catch((error) => {
            res.status(500).send({ error: "Internal server error"});
        });
});

//GET POR ID DE PACIENTE
router.get("/:id", protegerRuta(["admin", "physio", "patient"]), accesoId() , (req, res) => {
    Record.find({patient: req.params.id})
        .populate("patient")
        .then(result => {
            if(result)
                res.status(200).send({ result: result });
            else 
                res.status(404).send({ error: "No se ha encontrado el expediente" });
        }).catch((error) => {
            res.status(500).send({ error: "Internal server error"});
        });
});

//POST EXPEDIENTE
router.post("/", protegerRuta(["admin", "physio"]), (req, res) => {
    Patient.findById(req.body.patient)
        .then(result => {
            if(result){
                let record = new Record({
                    patient: result._id,
                    medicalRecord: req.body.medicalRecord,
                    appointments: []
                });
                record.save()
                  .then((result) => {
                    res.status(201).send({ result: result });
                  })
                  .catch((error) => {
                    res.status(400).send({ error: "Error guardando expediente" });
                  });
            }
            else
                res.status(404).send({ error: "No se ha encontrado paciente con esa ID"});
        }).catch(error => {
            res.status(500).send({ error: "Internal server error" });
        })
  });

//AÑADIR CONSULTAS A UN EXPEDIENTE (POR ID PACIENTE)
router.post('/:id/appointments', protegerRuta(["admin", "physio"]), (req, res) => {
    let appointment = new Appointment ({
        /* date: new Date(req.body.date), */
        date: req.body.date,
        physio: req.body.physio,
        diagnosis: req.body.diagnosis,
        treatment: req.body.treatment,
        observations: req.body.observations
    });
    //Record.findByIdAndUpdate(req.params.id, 
    Record.findOneAndUpdate({patient: req.params.id},
    {
        $push: {appointments: appointment} }, {new: true}
    )
    .then(result => {
        if (result)
            res.status(201).send({ result: result });
        else
            res.status(404).send({ error: "Fallo en la inserción" })
    }).catch(error => {
        res.status(500).send({ error: "Internal server error"});
    })
})

//DELETE (POR ID PACIENTE)
router.delete("/:id", protegerRuta(["admin", "physio"]), (req, res) => {
    Record.findOneAndDelete({patient: req.params.id})
    .populate("patient")
      .then((result) => {
        if (result) res.status(200).send({ result: result });
        else
          res.status(404).send({  error: "El expediente a eliminar no existe" });
      })
      .catch((error) => {
        res.status(500).send({ error: "Internal server error" });
      });
  });

module.exports = router;