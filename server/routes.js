// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push')
const serverVersion = '1.0.2';
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
  console.log(key);
  rsp.send(key); //rsp.json(key);  A los efectos prácticos primero lo hicimos como json, pero no
                 //debe mandarse en ese formato
});

//Enviar notificación PUSH a quienes queramos
//Realmente se controla del lado del server
router.post('/push', (req, rsp) => {
  const post = {
    title: req.body.title,
    body: req.body.body,
    user: req.body.user,
    icon: `img/avatars/${req.body.user}.jpg`,
    badge: 'img/favico.ico',
    image: 'https://datainfox.com/wp-content/uploads/2017/10/avengers-tower.jpg',
    vibrate: [125,75,125,275,200,275,125,75,125,275,200,600,200,600],
    url: '/index.html'
  }

  push.sendPushToAll(post);
  rsp.json(post);
});

router.post('/push2', (req, rsp) => {
  const post = {
    title: req.body.title,
    body: req.body.body,
    user: req.body.user,
    data: {
      type: req.body.type,
    },
    icon: `pushimage.php?file=pushicon.png`,
    badge: 'pushimage.php?file=pushdancing.png',
    vibrate: [100,50,100,50,100,50,100,50,100,50],
    actions: [
      {
        action: 'close',
        title: req.body.title,
        icon: 'images/xmark.png'
      },
    ],
    url: '/index.php'
  }

  push.sendPushToAll(post);
  rsp.json(post);
});


router.post('/pushBookingWasConfirmed', (req, rsp) => {
  //console.log(req);
  const auth = req.headers.authorization;

  /*
  console.log("-"+auth+"-");
  console.log("true", (auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1"));
  */
  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    //console.log("Authorized!");
    //let body = "<(cuando)>\n\nEl curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> ya está disponible para que sea reservado.";
    let body = "El curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> ya está disponible para que sea reservado.";

    //body = body.replace("<(cuando)>", new Date);
    body = body.replace("<(curso)>", req.body.curso);
    body = body.replace("<(sucursal)>", req.body.sucursal);
    body = body.replace("<(horario)>", req.body.horario);
    body = body.replace("<(día)>", req.body.dia);

    const post = {
      serverVersion,
      title: "Reserva disponible",
      body: body,
      type: 'clss',
      icon: `pushimage.php?file=pushicon.png`,
      badge: 'pushimage.php?file=pushdancing.png',
      vibrate: [100,50,100,50,100,50,100,50,100,50],
      actions: [
        {
          action: 'close',
          title: "Reserva disponible",
          icon: 'images/xmark.png'
        },
      ],
      url: '/index.php',
      recipients: []
    }

    let recipients = req.body.recipients;
    let p256 = req.body.p256;
    let auth = req.body.auth;

    /*
    console.log(recipients);
    console.log(p256);
    console.log(auth);
    */

    //push.sendPushToAll(post);
    recipients = recipients.split(',');
    p256 = p256.split(',');
    auth = auth.split(',');
    let err = "";

    for(var i=0;i<recipients.length;i++) {
      err = "Trying";
      err = push.sendPushSubscription(post, recipients[i], p256[i], auth[i]);
      post.recipients.push({
        recipient: recipients[i],
        error: "WTF!?",
        err
      })
    }
    rsp.json(post);
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
});

module.exports = router;