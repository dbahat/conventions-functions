import { get } from 'https';
import { readFile } from 'fs/promises';

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
export async function getFeed(req, res) {
  const accessToken = await readFile('/feed_token/FEED_TOKEN', 'utf8');
  const sinceParam = req.query.since;
  const page = req.query.page;
  const url = "https://graph.facebook.com/v5.0/" + page + "/feed?fields=message,created_time&access_token=" + accessToken + (sinceParam ? "&since=" + sinceParam : "");
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

