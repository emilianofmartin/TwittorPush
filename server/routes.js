// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push')

const mensajes = [

  {
    _id: 'XXX',
    user: 'spiderman',
    mensaje: 'Hola Mundo'
  }

];


// Get mensajes
router.get('/', function (req, res) {
  // res.json('Obteniendo mensajes');
  res.json( mensajes );
});


// Post mensaje
router.post('/', function (req, res) {
  
  const mensaje = {
    mensaje: req.body.mensaje,
    user: req.body.user
  };

  mensajes.push( mensaje );

  //console.log(mensajes);


  res.json({
    ok: true,
    mensaje
  });
});

//Almacenar la suscripción
router.post('/subscribe', (req, rsp) => {
  //console.log('req', req);
  const subscription = req.body;
  console.log(subscription);

  push.addSubscription(subscription);
  
  rsp.json('subscribe');
});

//Obtener key público
router.get('/key', (req, rsp) => {
  const key = push.getKey();
  rsp.send(key); //rsp.json(key);  A los efectos prácticos primero lo hicimos como json, pero no
                 //debe mandarse en ese formato
});

//Enviar notificación PUSH a quienes queramos
//Realmente se controla del lado del server
router.post('/push', (req, rsp) => {
  const post = {
    title: req.body.title,
    body: req.body.body,
    user: req.body.user
  }

  push.sendPushToAll(post);
  rsp.json(post);
});

module.exports = router;