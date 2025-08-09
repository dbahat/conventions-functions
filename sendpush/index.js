const functions = require('firebase-functions');
const admin = require('firebase-admin');
const googleAuth = require('google-auth-library');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.sendPush = functions.https.onRequest(async (req, res) => {
    try {
        const ok = await verifyAuthentication(req);
        if (!ok) {
            res.status(403).send("User is not authorized");
            return;
        }
    } catch (err) {
        console.log("cannot verify token", err);
        res.status(400).send("Authentication error");
        return;
    }

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

async function verifyAuthentication(req) {
    let idToken = req.headers.authorization;
    if (!idToken || !idToken.startsWith("Bearer ")) {
        console.log("Invalid token - does not start with 'Bearer ':" + idToken);
        return false;
    }
    idToken = idToken.slice("Bearer ".length);

    const client = new googleAuth.OAuth2Client();
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      // Must match the login client id in sendpushconsole
      audience: "458203975509-m13qm03dljkbob9u1k7bq9vgkc0kohsq.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    const email = payload['email'];

    const authorizedUsers = [
        "tal.sapan1@gmail.com",
        "dbahat@live.com",
        "marketing@animatsuri.org.il"
    ];

    for (let i = 0; i < authorizedUsers.length; ++i) {
        if (authorizedUsers[i] == email) {
            console.log("User is authorized:" + email);
            return true;
        }
    }

    console.log("User is not authorized:" + email);
    return false;
}
