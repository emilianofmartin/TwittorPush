// Routes.js - Módulo de rutas
const express = require('express');
const router = express.Router();
const push = require('./push')
const serverVersion = '1.0.17';
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


router.post('/pushBookingIsAvailable', (req, rsp) => {
  //console.log(req);
  const auth = req.headers.authorization;

  /*
  console.log("-"+auth+"-");
  console.log("true", (auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1"));
  */
  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    //console.log("Authorized!");
    var body = "";
    var title = "";
    var action = "";
    var close = ""
    //let body = "<(cuando)>\n\nEl curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> ya está disponible para que sea reservado.";
    const lng = req.body.lng || 'spa';
    if(lng == "spa") {
      body = "El curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> ya está disponible para que sea reservado.";
      title = "Reserva disponible";
      action = "Reservar";
      close = "Cerrar";
    }
    if(lng == "eng") {
      body = "The course <(curso)> at <(sucursal)> which starts at <(horario)> on <(día)> is already available for being booked.";
      title = "Available booking";
      action = "Book";
      close = "Close";
    }

    //body = body.replace("<(cuando)>", new Date);
    body = body.replace("<(curso)>", req.body.curso);
    body = body.replace("<(sucursal)>", req.body.sucursal);
    body = body.replace("<(horario)>", req.body.horario);
    body = body.replace("<(día)>", req.body.dia);

    const post = {
      serverVersion,
      title,
      body: body,
      type: 'clss',
      icon: `pushimage.php?file=pushicon.png`,
      badge: 'pushimage.php?file=pushdancing.png',
      vibrate: [100,50,100,50,100,50,100,50,100,50],
      cursId: req.body.cursId,
      cursName: req.body.curso,
      teacherId: req.body.teacherId,
      room: req.body.room,
      locationId: req.body.locationID,
      location: req.body.sucursal,
      clssTime: req.body.clssTime,
      actions: [
        {action: 'view', title: action,
          icon: 'images/checkmark.png'},
        {action: 'close', title: close,
          icon: 'images/xmark.png'},
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

   ({ recipients, p256, auth } = processPost(recipients, p256, auth, post));
    rsp.json(post);
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
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
    var body = "";
    var title = "";
    //var action = "";
    var close = ""
    const lng = req.body.lng || 'spa';
    if(lng == "spa") {
      if(req.body.gender == 2)
        body = "Hola, <(nombre)>. Has sido anotada en el curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> luego de que se abriera un cupo.";
      else
        body = "Hola, <(nombre)>. Has sido anotado en el curso <(curso)> de <(sucursal)> que empieza a las <(horario)> del día <(día)> luego de que se abriera un cupo.";
      title = "Reserva realizada";
      close = "Cerrar";
    }
    if(lng == "eng") {
      body = "Hello, <(nombre)>. You've been booked on the course <(curso)> at <(sucursal)> which starts at <(horario)> on <(día)> after a quota was opened.";
      title = "Booking was made";
      close = "Close";
    }

    //body = body.replace("<(cuando)>", new Date);
    body = body.replace("<(nombre)>", req.body.nombre);
    body = body.replace("<(curso)>", req.body.curso);
    body = body.replace("<(sucursal)>", req.body.sucursal);
    body = body.replace("<(horario)>", req.body.horario);
    body = body.replace("<(día)>", req.body.dia);

    const post = {
      serverVersion,
      title,
      body: body,
      type: 'clss',
      icon: `pushimage.php?file=pushicon.png`,
      badge: 'pushimage.php?file=pushdancing.png',
      vibrate: [100,50,100,50,100,50,100,50,100,50],
      actions: [
        {
          action: 'close',
          title: close,
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

    ({ recipients, p256, auth } = processPost(recipients, p256, auth, post));
    rsp.json(post);
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
});

router.post('/validate', (req, rsp) => {
  //console.log(req);
  const auth = req.headers.authorization;

  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    //console.log("Authorized!");
    const lng = req.body.lng || 'spa';
    var body = "";
    var title = "";
    //var action = "";
    var close = ""  

    const post = {
      serverVersion,
      title,
      body: body,
      type: 'msg',
      icon: `pushimage.php?file=pushicon.png`,
      badge: 'pushimage.php?file=pushnewmessage.png',
      forum: req.body.groupID,
      folder: '',
      vibrate: [100,50,100,50,100,50,100,50,100,50],
      actions: [
        {
          action: 'close',
          title: close,
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

    ({ recipients, p256, auth } = processPost(recipients, p256, auth, post));
    rsp.json(post);
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
});


router.post('/pushNewMessage', (req, rsp) => {
  //console.log(req);
  const auth = req.headers.authorization;

  /*
  console.log("-"+auth+"-");
  console.log("true", (auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1"));
  */
  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    //console.log("Authorized!");
    const lng = req.body.lng || 'spa';
    var body = "";
    var title = "";
    //var action = "";
    var close = ""
    if(lng == "spa") {
      body = "Hola, <(nombre)>. Hay un nuevo mensaje en el grupo <(grupo)> de <(remitente)>:\n\n'<(mensaje)>'";
      title = "Nuevo mensaje";
      close = "Cerrar";
    }
    if(lng == "eng") {
      body = "Hello, <(nombre)>. There is a new message in the group <(grupo)> by <(remitente)>:\n\n'<(mensaje)>'";
      title = "New message";
      close = "Close";
    }
  

    //body = body.replace("<(cuando)>", new Date);
    body = body.replace("<(nombre)>", req.body.nombre);
    body = body.replace("<(grupo)>", req.body.grupo);
    body = body.replace("<(remitente)>", req.body.remitente);
    body = body.replace("<(mensaje)>", req.body.mensaje);

    const post = {
      serverVersion,
      title,
      body: body,
      type: 'msg',
      icon: `pushimage.php?file=pushicon.png`,
      badge: 'pushimage.php?file=pushnewmessage.png',
      forum: req.body.groupID,
      folder: '',
      vibrate: [100,50,100,50,100,50,100,50,100,50],
      actions: [
        {
          action: 'close',
          title: close,
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

    ({ recipients, p256, auth } = processPost(recipients, p256, auth, post));
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

function processPost(recipients, p256, auth, post) {
  recipients = recipients.split(',');
  p256 = p256.split(',');
  auth = auth.split(',');
  let err = "";

  for (var i = 0; i < recipients.length; i++) {
    err = push.sendPushSubscription(post, recipients[i], p256[i], auth[i])
    post.recipients.push({
      recipient: recipients[i],
      error: err
    });
  }
  return { recipients, p256, auth };
}

//Obtener subscriptions
router.get('/subscriptions', (req, rsp) => {
  const auth = req.headers.authorization;

  /*
  console.log("-"+auth+"-");
  console.log("true", (auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1"));
  */
  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    rsp.json(push.getSubscriptions());
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
});

router.get('/subscription/:regId', (req, rsp) => {
  const auth = req.headers.authorization;
  const regId = req.params.regId;

  /*
  console.log("-"+auth+"-");
  console.log("true", (auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1"));
  */
  if(auth === "XaL8uXCgiKFSmxXjRDGcf64S0rOgjuK4kwNhRBiZT8IMBhhKZflX5ENm09AFEFM1") {
    const subs = push.getSubscriptions();
    let includes = false;
    subs.forEach((s) => {
      if(s.endpoint.includes(`send/${regId}`))
        includes = true;
    });

    /*
    rsp.json({
      subs,
      includes
    })
    */
    if(includes)
      rsp.json('Found');
    else
      rsp.json('Not found');
  }
  else {
    rsp.json({
      ok:false,
      error: 'Authorization is missing or wrong'
    });
  }
});