const fs = require('fs');
const vapid = require('./vapid.json');
const urlsafeBase64 = require('urlsafe-base64');

const webpush = require('web-push');
webpush.setVapidDetails(
    'mailto:emiliano.martin@gmail.com',
    vapid.publicKey,
    vapid.privateKey
  );

const subscriptions = require('./subs-db.json');
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
    subscriptions.forEach((subscription, i) => {
        webpush.sendNotification(subscription, JSON.stringify(post));
    });
};