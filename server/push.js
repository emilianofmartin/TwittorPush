const fs = require('fs');
const vapid = require('./vapid.json');
const urlsafeBase64 = require('urlsafe-base64');

const webpush = require('web-push');
webpush.setVapidDetails(
    'mailto:emiliano.martin@gmail.com',
    vapid.publicKey,
    vapid.privateKey
  );

let subscriptions = require('./subs-db.json');
//Si purgáramos todas las subscripciones, habría que guardar un [] en subs-db.json

module.exports.getKey = () => {
    return urlsafeBase64.decode(vapid.publicKey);
};

module.exports.addSubscription = (subscription) => {
    subscriptions.push(subscription);
    //console.log(subscriptions);
    fs.writeFileSync(`${__dirname}/subs-db.json`,
      JSON.stringify(subscriptions));
}

module.exports.sendPushToAll = (post) => {
    console.log("Mandando PUSHES");
    const sentNotifications = [];

    subscriptions.forEach((subscription, i) => {
        console.log(subscription);
        const pushProm = webpush.sendNotification(subscription, JSON.stringify(post))
            .then(console.log("Notificación enviada"))
            .catch(err => {
                console.log("Notificación falló");
                console.log(err.statusCode);

                if(err.statusCode === 410 ) {
                    //GONE
                    subscriptions[i].delete = true;
                    //No la borro directamente, porque si lo hiciera
                    //saltaría al siguiente elemento del forEach
                }
            });

        sentNotifications.push(pushProm);
    });

    Promise.all(sentNotifications)
        .then(() => {
            subscriptions = subscriptions.filter( subs => !subs.delete);
            fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
        });
};

module.exports.sendPushSubscription = (post, recipient, p256, auth) => {
    console.log("Mandando PUSHES");
    const subscription = {
        endpoint: `https://fcm.googleapis.com/fcm/send/${recipient}`,
        expirationTime: null,
        keys: {
          p256dh: `${p256}`,
          auth: `${auth}`
        }
      }
    console.log(subscription);
    addSubscription(subscription);
/*
    let error = "Trying..."
    const pushProm = webpush.sendNotification(subscription, JSON.stringify(post))
        .then(() => {
            console.log("Notificación enviada");
            error = "Sent!";
        })
        .catch(err => {error = err});

    sentNotifications.push(pushProm);

    await Promise.all(sentNotifications)
        .then(() => {
            subscriptions = subscriptions.filter( subs => !subs.delete);
            fs.writeFileSync(`${__dirname}/subs-db.json`, JSON.stringify(subscriptions));
        });
    
    return error;
*/
    let error = "Trying...";
    let sentNotifications = []; 
    const p = webpush.sendNotification(subscription, JSON.stringify(post))
        .then(() => {
            console.log("Notificación enviada");
            error = "Sent!";
        })
        .catch(err => {
            error = err;
        });
    sentNotifications.push(p);
    
    Promise.all(sentNotifications)
        .then(() => {
            return error;
        });

    return 'Did not wait!';
};