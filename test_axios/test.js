// Importa las librerías necesarias
const axios = require('axios');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Patient = require(__dirname + "/models/patient");
const Physio = require(__dirname + "/models/physio");
const Record = require(__dirname + "/models/record");
const User = require(__dirname + '/models/user');

// Conecta a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/physiocare')

// Crea una instancia de Axios 
const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    }
});

/* FUNCIONES AUXILIARES */

// Configura el token de autenticación
const setToken = (token) => {
    if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axiosInstance.defaults.headers.common['Authorization'];
    }
}

// Borra las colecciones existentes
const borrarDatos = async() => {
    try {
        await User.deleteMany({});
        await Patient.deleteMany({});
        await Physio.deleteMany({});
        await Record.deleteMany({});        
    } catch (error) {
        console.error("Error al borrar las colecciones:", error);
    }
}

// Carga de datos inicial
const cargarDatos = async() => {
    try {   
        
        // Array de Users
        const users = [
            new User({
                login: 'admin',
                password:'1234567',
                rol: 'admin'
            }),
            new User({
                _id: '111111111111111111111111',
                login: 'fisio1',
                password: 'fisio11',
                rol: 'physio'
            }),
            new User({
                _id: '222222222222222222222222',
                login: 'fisio2',
                password: 'fisio22',
                rol: 'physio'
            }),
            new User({
                _id: '333333333333333333333333',
                login: 'paciente1',
                password: 'paciente1',
                rol: 'patient'
            }),
            new User({
                _id: '444444444444444444444444',
                login: 'paciente2',
                password: 'paciente2',
                rol: 'patient'
            })];

        // Array de pacientes y fisios asociados a users
        // Se deja a null las casillas correspondientes a admins

        const pacientes_fisios = [
            null,
            new Physio({
                name: 'Javier',
                surname: 'Martínez',
                specialty: 'Sports',
                licenseNumber: 'A1234567'
            }),
            new Physio({
                name: 'Ainhoa',
                surname: 'Fernández',
                specialty: 'Neurological',
                licenseNumber: 'B7654321'
            }),
            new Patient({
                name: 'José',
                surname: 'López',
                birthDate: new Date('1985-06-15'),
                address: 'Calle Mayor 123, Alicante',
                insuranceNumber: '123456789'
            }),
            new Patient({
                name: 'Ana',
                surname: 'Pérez',
                birthDate: new Date('1990-09-22'),
                address: 'Avenida del Sol 45, Valencia',
                insuranceNumber: '987654321'
            })    
        ]

        // Encriptar las contraseñas y guardar cada usuario          
        for (let i = 0; i < users.length; i++) {
            users[i].password = await bcrypt.hash(users[i].password, 10);
            let usuario = await users[i].save();
            if(usuario.rol != 'admin')
            {
                pacientes_fisios[i]._id = usuario._id;
                await pacientes_fisios[i].save();
            }
        }          

        let pacientes = await Patient.find();
        let fisios = await Physio.find();
      
      // Crea expedientes médicos con citas
      const records = [
          new Record({
              patient: pacientes[0]._id,
              medicalRecord: 'Paciente con antecedentes de lesiones en rodilla y cadera.',
              appointments: [
                  {
                      date: new Date('2024-02-10'),
                      physio: fisios[0]._id, // Especialidad: Sports
                      diagnosis: 'Distensión de ligamentos de la rodilla',
                      treatment: 'Rehabilitación con ejercicios de fortalecimiento',
                      observations: 'Se recomienda evitar actividad intensa por 6 semanas'
                  },
                  {
                      date: new Date('2024-03-01'),
                      physio: fisios[0]._id,
                      diagnosis: 'Mejoría notable, sin dolor agudo',
                      treatment: 'Continuar con ejercicios, añadir movilidad funcional',
                      observations: 'Próxima revisión en un mes'
                  }
              ]
          }),
          new Record({
              patient: pacientes[1]._id,
              medicalRecord: 'Paciente con problemas neuromusculares.',
              appointments: [
                  {
                      date: new Date('2024-02-15'),
                      physio: fisios[1]._id, // Especialidad: Neurological 
                      diagnosis: 'Debilidad muscular en miembros inferiores',
                      treatment: 'Terapia neuromuscular y estiramientos',
                      observations: 'Revisar la evolución en 3 semanas'
                  }
              ]
          }),
      ];
  
      // Guarda todos los expedientes utilizando Promise.all
      const savedRecords = await Promise.all(records.map(record => record.save()));      

      // Desconecta la base de datos
      mongoose.disconnect();
      
      } catch (error) {
          console.error('Error añadiendo datos:', error);
          mongoose.disconnect();
      }
}

// Función principal de ejecución de pruebas
const ejecutarTestsBasicos = async() => {

    // Elimina los datos de prueba previos para asegurar un entorno limpio
    await borrarDatos(); 
    // Carga datos de prueba necesarios para la ejecución de los tests
    await cargarDatos();  

     /* PRUEBAS CON USUARIO PACIENTE */

     // Realiza login como paciente y obtiene el token de autenticación
    let tokenPaciente = await loginCorrecto('paciente1', 'paciente1');
    // Intenta obtener la lista de pacientes, acción no permitida para un paciente
    await obtenerPacientesConUsuarioNoAutorizado(tokenPaciente);
    // Un paciente válido accede a sus propios datos
    await obtenerDatosPacienteAutorizado(tokenPaciente);
    //NUEVO TEST
    // Un paciente válido intenta acceder a datos de otro paciente
    await obtenerDatosPacienteNoAutorizado(tokenPaciente);
    // Buscar fisios por especialidad con un token de paciente válido
    await busquedaFisiosPorEspecialidad(tokenPaciente, 'Sports');
    
    /* PRUEBAS CON USUARIO FISIO */

    // Realiza login como fisio y obtiene el token de autenticación
    let tokenFisio = await loginCorrecto('fisio1', 'fisio11');    
    // Añade un nuevo paciente, acción permitida para un fisio
    let pacienteID = await insertarPacienteConUsuarioAutorizado(tokenFisio);
    // Accede a datos de un paciente inexistente
    await obtenerDatosPacienteNoExiste(tokenFisio);
    // Crea un expediente de un paciente válido, acción permitida para un fisio
    let expedienteNuevo = await crearExpedientePacienteValido(tokenFisio, pacienteID)
    // Añade una cita al expediente de un paciente válido

    //Modificar calle paciente
    await modificarCallePaciente(tokenFisio, pacienteID);
    
    /* PRUEBAS CON USUARIO ADMINISTRADOR */

    // Realiza login como administrador y obtiene el token de autenticación
    let tokenAdmin = await loginCorrecto('admin', '1234567');    
    // Añade un nuevo fisio, acción permitida para un admin
    let fisioID = await insertarFisioConUsuarioAutorizado(tokenAdmin);  
    // Modifica los datos de un fisio válido, acción permitida para un admin
    await modificarFisio(tokenAdmin, fisioID);
    // Borra un fisio válido, acción permitida para un admin
    await borrarFisio(tokenAdmin, fisioID);  
    
}

/* TESTS BÁSICO */


async function loginCorrecto(user, password) {
    try {                 
        const respuesta = await axiosInstance.post('/auth/login', {
            login: user, 
            password: password 
        });
        
        if (respuesta.status == 200) {        
            console.log('OK - Inicio de sesión correcto');
            return respuesta.data.result; // Devolvemos el token
        } else
            throw new Error();

    } catch (error) {
        console.log("ERROR - Inicio de sesión correcto", error);
        return null;
    }    
}

// Listado de pacientes con usuario no autorizado
const obtenerPacientesConUsuarioNoAutorizado = async(token) => {    
    setToken(token);
    try {        
        const respuesta = await axiosInstance.get('/patients');       
    } catch (error) {        
        if (error.response.status == 401 || error.response.status == 403)
            console.log("OK - Obtener listado de pacientes con usuario sin autorización");
        else{
            console.log("ERROR - Obtener listado de pacientes con usuario sin autorización");
        }
    }
}

// Obtener los datos de un paciente para un paciente autorizado
const obtenerDatosPacienteAutorizado = async(token) => {
    setToken(token);
    try {
        const respuesta = await axiosInstance.get('/patients/333333333333333333333333');
        if (respuesta.status == 200 && respuesta.data.result)
            console.log("OK - Obtener datos de paciente autorizado ");
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Obtener datos de paciente autorizado");
    }
}

// Obtener los datos de un paciente para un paciente autorizado
const obtenerDatosPacienteNoAutorizado = async(token) => {
    setToken(token);
    try {
        const respuesta = await axiosInstance.get('/patients/444444444444444444444444');
        if (respuesta.status == 200 && respuesta.data.result)
            console.log("ERROR - Obtener datos de paciente no autorizado ");
        else
            throw new Error();
    } catch (error) {
        if (error.response.status == 401 || error.response.status == 403)
            console.log("OK - Obtener datos de paciente no autorizado ");
        else
            console.log("ERROR - Obtener datos de paciente no autorizado (catch)");
    }
}

// Obtener los datos de un paciente con un ID inexistente (physio, admin)
const obtenerDatosPacienteNoExiste = async (token) => {
    setToken(token);
    try {
        const respuesta = await axiosInstance.get('/patients/000000000000000000000000');
        console.log("ERROR - Datos de paciente con ID incorrecto");
    } catch (error) {
        if(error.response.status == 404)
            console.log("OK - Datos de paciente con ID inexistente");
        else
            console.log("ERROR - Datos de paciente con ID inexistente");
    }
}

// Insertar paciente con un usuario autorizado
const insertarPacienteConUsuarioAutorizado = async (token) => {
    setToken(token);

    const paciente1 = {
        name: 'AAAAAAAA', 
        surname: "AAAAAAAAAAA", 
        birthDate: new Date('1991-05-12'), 
        address: 'Calle A, Número A',
        insuranceNumber: '01010101A', 
        login: 'AAAAAAA',
        password: 'AAAAAAA'
    };

    try {
        const respuesta = await axiosInstance.post('/patients', paciente1);
        if (respuesta.status == 201 && respuesta.data.result) {
            console.log("OK - Insertar paciente con usuario autorizado");  
            return respuesta.data.result._id;
        }    
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Insertar paciente con usuario autorizado");
        return null;
    }
}

//Modificar calle paciente
const modificarCallePaciente = async (token, pacienteID) => {
    setToken(token);

    const datos = {
        name: 'AAAAAAAA', 
        surname: "AAAAAAAAAAA", 
        birthDate: new Date('1991-05-12'), 
        address: 'Calle Nueva',
        insuranceNumber: '01010101A', 
    };

    try {
        const respuesta = await axiosInstance.put(`/patients/${pacienteID}`, datos);
        if (respuesta.status == 200 && respuesta.data.result) {
            console.log("OK - Modificar paciente con usuario autorizado");  
            return respuesta.data.result._id;
        }    
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Modificar paciente con usuario autorizado");
        return null;
    }
}

// Insertar fisio con usuario autorizado (admin)
const insertarFisioConUsuarioAutorizado = async (token) => {
    setToken(token);

    const fisio1 = {
        name: 'BBBBBBBBB', 
        surname: 'BBBBBBBBBB', 
        specialty: 'Pediatric',
        licenseNumber: '0B0B0B0B',        
        login: 'BBBBBBB',
        password: 'BBBBBBB'
    };

    try {
        const respuesta = await axiosInstance.post('/physios', fisio1);
        if (respuesta.status == 201 && respuesta.data.result) {
            console.log("OK - Insertar fisio con usuario autorizado");
            return respuesta.data.result._id;  
        }
        else
            throw new Error();
    } catch (error) {        
        console.log("ERROR - Insertar fisio con usuario autorizado");
        return null;
    }
}

// Búsqueda de fisios por especialidad
const busquedaFisiosPorEspecialidad = async (token, especialidad) => {
    setToken(token);
    try {
        const respuesta = await axiosInstance.get('/physios/find', {params: {specialty: especialidad}});        
        if (respuesta.status == 200 )
            console.log("OK - Búsqueda fisios por especialidad");  
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Búsqueda fisios por especialidad ");
    }
}

const crearExpedientePacienteValido = async (token, pacienteID) => {
    setToken(token);    
    const expediente1 = {
        patient:  pacienteID,
        medicalRecord: 'Expediente de paciente de prueba'
    }

    try {
        const respuesta = await axiosInstance.post('/records', expediente1);
        if (respuesta.status == 201 && respuesta.data.result){
            console.log("OK - Creado expediente médico con usuario autorizado y paciente válido"); 
            return respuesta.data.result;
        }
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Creado expediente médico con usuario autorizado y paciente válido ");
    }
};

const borrarFisio = async (token, fisioID) => {
    setToken(token);    
    try {
        const respuesta = await axiosInstance.delete(`/physios/${fisioID}`);
        if (respuesta.status == 200 && respuesta.data.result)
            console.log("OK - Borrado fisio válido con usuario autorizado");  
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Borrado fisio válido con usuario autorizado ");
    }
}

const modificarFisio = async (token, fisioID) => {
    setToken(token);

    const updateData = {
        name: 'DDDDDDD',
        surname: 'DDDDDDDDD',
        specialty: 'Sports',
        licenseNumber: '0D0D0D0D'       
    };
    
    try {
        const respuesta = await axiosInstance.put(`/physios/${fisioID}`, updateData);
        if (respuesta.status == 200 && respuesta.data.result)
            console.log("OK - Modificación fisio válido con usuario autorizado");  
        else
            throw new Error();
    } catch (error) {
        console.log("ERROR - Modificación fisio válido con usuario autorizado " + error.message);
    }
}

ejecutarTestsBasicos();









