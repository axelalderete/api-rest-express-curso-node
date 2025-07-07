const debug = require("debug")("app:inicio");
const express = require("express");
// const dbDebug = require('debug')('app:db')
const config = require("config");
const app = express();
const Joi = require("@hapi/joi");
const morgan = require("morgan");
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// configuacion de entornos
console.log("Aplicacion: " + config.get("nombre"));
console.log("DB server: " + config.get("configDB.host"));

//uso de middleware de terceros
if (app.get("env") === "development") {
  app.use(morgan("tiny"));
  debug('Morgan esta habilitado')
}


//Trabajos con la base de datos
debug('Conectando con la base de datos')

app.get("/", (req, res) => {
  res.send("hola mundo");
}); //peticion

const usuarios = [
  { id: 1, nombre: "axel" },
  { id: 2, nombre: "ana" },
  { id: 3, nombre: "milo" },
  { id: 4, nombre: "tyson" },
];

app.get("/api/usuarios", (req, res) => {
  res.send(usuarios);
});

app.get("/api/usuarios/:id", (req, res) => {
  //   Encontrar si existe el usuario
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
  }
  res.send(usuario);
});

app.post("/api/usuarios", (req, res) => {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  const { error, value } = validarUsuario(req.body.nombre);

  if (!error) {
    const usuario = {
      id: usuarios.length + 1,
      nombre: value.nombre,
    };
    usuarios.push(usuario);
    res.send(usuario);
  } else {
    res.status(400).send(error.details[0].message);
  }
});

app.put("/api/usuarios/:id", (req, res) => {
  let usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
  }

  const { error, value } = validarUsuario(req.body.nombre);

  if (error) {
    res.status(400).send(error.details[0].message);
    return;
  }

  usuario.nombre = value.nombre;
  res.send(usuario);
});

app.delete("/api/usuarios/:id", (req, res) => {
  const usuario = existeUsuario(req.params.id);
  if (!usuario) {
    res.status(404).send("El usuario no fue encontrado");
  }
  const index = usuarios.indexOf(usuario);
  usuarios.splice(index, 1);
  res.send(usuarios);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Escuchando en el puerto ${port}`);
});

function existeUsuario(id) {
  return usuarios.find((u) => u.id === parseInt(id));
}

function validarUsuario(nom) {
  const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
  });
  return schema.validate({ nombre: nom });
}
