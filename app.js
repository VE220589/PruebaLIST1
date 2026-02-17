const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();

const PORT = 3000;
const SECRET_KEY = "mi_clave_secreta";


// CONFIGURACIÓN
app.set("view engine", "ejs");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


// DATOS SIMULADOS
const productos = [
  { id: 1, nombre: "Laptop", precio: 1200 },
  { id: 2, nombre: "Mouse", precio: 25 },
  { id: 3, nombre: "Teclado", precio: 45 },
  { id: 4, nombre: "Monitor", precio: 300 },
];


// FUNCIÓN PARA MOSTRAR ERRORES
function mostrarError(res, codigo, mensaje, descripcion, imagen) {

  return res.status(codigo).render("error", {
    codigo,
    mensaje,
    descripcion,
    imagen,
  });

}


// RUTA PRINCIPAL
app.get("/", (req, res) => {

  res.json({
    mensaje: "API funcionando correctamente",
  });

});


//LOGIN
app.post("/api/login", (req, res) => {

  const { usuario, password } = req.body;

  if (!usuario || !password) {

    return res.status(400).json({
      error: true,
      mensaje: "Debe ingresar usuario y contraseña"
    });

  }

  if (usuario === "admin" && password === "1234") {

    const token = jwt.sign(
      { usuario },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    return res.json({
      error: false,
      mensaje: "Login exitoso",
      token
    });

  }

  return res.status(401).json({
    error: true,
    mensaje: "Credenciales incorrectas"
  });

});



// MIDDLEWARE VERIFICAR TOKEN
function verificarToken(req, res, next) {

  const header = req.headers["authorization"];

  if (!header) {

    return mostrarError(
      res,
      401,
      "Acceso denegado",
      "Debe enviar un token JWT",
      "401.png"
    );

  }

  const token = header.split(" ")[1];

  try {

    jwt.verify(token, SECRET_KEY);

    next();

  } catch {

    return mostrarError(
      res,
      401,
      "Token inválido",
      "El token no es válido o expiró",
      "401.png"
    );

  }

}


// ENDPOINT PROTEGIDO
app.get("/api/productos", verificarToken, (req, res) => {

  res.json(productos);

});


// RUTA PARA MOSTRAR ERRORES PERSONALIZADOS
app.get("/error/:codigo", (req, res) => {

  const codigo = req.params.codigo;

  const errores = {

    400: {
      mensaje: "Solicitud incorrecta",
      descripcion: "Datos inválidos",
      imagen: "400.png"
    },

    401: {
      mensaje: "No autorizado",
      descripcion: "Credenciales incorrectas",
      imagen: "401.png"
    },

    404: {
      mensaje: "Página no encontrada",
      descripcion: "La página no existe",
      imagen: "404.png"
    },

    500: {
      mensaje: "Error interno",
      descripcion: "Error del servidor",
      imagen: "500.png"
    }

  };

  const error = errores[codigo] || errores[500];

  res.status(codigo).render("error", {
    codigo,
    mensaje: error.mensaje,
    descripcion: error.descripcion,
    imagen: error.imagen
  });

});


// ERROR 404 GLOBAL (SIEMPRE AL FINAL)
app.use((req, res) => {

  mostrarError(
    res,
    404,
    "Página no encontrada",
    "La página que busca no existe",
    "404.png"
  );

});


// ERROR 500 GLOBAL
app.use((err, req, res, next) => {

  console.error(err);

  mostrarError(
    res,
    500,
    "Error interno del servidor",
    "Ocurrió un error inesperado",
    "500.png"
  );

});


// INICIAR SERVIDOR
app.listen(PORT, () => {

  console.log(`Servidor corriendo en http://localhost:${PORT}`);

});
