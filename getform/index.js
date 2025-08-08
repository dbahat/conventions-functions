import { get, request } from 'https';
import { readFile } from 'fs/promises';

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
export async function getForm(req, res) {
  const accessToken = await getAccessToken();
  const formIdParam = "1ALbyGtuSyOP9Dl-KYqL2nQSVVflxMYKI5B8KVpvq75o";// req.query.formId
  const url = "https://forms.googleapis.com/v1/forms/" + formIdParam + "?access_token=" + accessToken;
  const response = await doGet(url);
  res.status(200).send(response);
}

/**
 * Do a request with options provided.
 *
 * @param {Object} options
 * @param {Object} data
 * @return {Promise} a promise of request
 */
async function doGet(options) {
  return new Promise((resolve, reject) => {
    const req = get(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function doPost(url, data) {
  return new Promise((resolve, reject) => {
    const req = request(url, {method: "POST"}, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        resolve(JSON.parse(responseBody));
      });
    });

    req.write(data);
    req.end();

    req.on('error', (err) => {
      reject(err);
    });
  });
}

async function getAccessToken() {
    const clientID = "458203975509-psvkgk2jo1es6elvec4tsfo2hampv261.apps.googleusercontent.com";
    const clientSecret = await readFile("/forms_client_secret/FORMS_CLIENT_SECRET", "utf8");

    // Should be valid for half a year since the last use
    const refreshToken = await readFile("/forms_token/FORMS_TOKEN", "utf8");
    
    const data = JSON.stringify({
        access_type: "offline",
        refresh_token: refreshToken,
        client_id: clientID,
        client_secret: clientSecret,
        grant_type: "refresh_token"
    });
    
    const url = "https://oauth2.googleapis.com/token";
    const response = await doPost(url, data);
    if (response.error) {
        throw response;
    }
    return response.access_token;
}