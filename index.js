const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.sendPush = functions.https.onRequest(async (req, res) => {

    if (!req.body.topic) {
        console.log("Got a message without a topic. body:" + JSON.stringify(req.body))
        res.status(400).send('No topic defined!');
        return;
    }

    const payload = {
        topic: req.body.topic,
        notification: {
            body: req.body.body,
        },
        data: {
            message: req.body.body,
            topic: req.body.topic,
            id: req.body.id
        }
    };

    if (req.body.title) {
        payload.notification.title = req.body.title;
    }

    console.log("sending message for topic " + req.body.topic + " with id " + req.body.id + " and message " + req.body.body);
    try {
        const response = await admin.messaging().send(payload);
        console.log("Successfully sent message:", response);
        res.status(200).send();
    } catch (error) {
        console.log("Error sending message:", error);
        res.status(500).send(error);
    }
});
