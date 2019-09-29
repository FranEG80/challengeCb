
const { WebClient } = require('@slack/web-api');

const API_SLACK_BOT = process.env.API_SLACK_BOT || 'api_slack_bot'
const TOKEN_SLACK = process.env.TOKEN_SLACK || 'token'
 
// Read a token from the environment variables
const token = process.env.TOKEN_SLACK;
 
// Initialize
const web = new WebClient(token);

module.exports.command = (req, res, next) => {

  let payload = req.body;
    res.sendStatus(200);
      (async () => {

              // Post a message to the channel, and await the result.
              // Find more arguments and details of the response: https://api.slack.com/methods/chat.postMessage
              const result = await web.chat.postMessage({
                text: 'Hello world!',
                channel: payload.event.channel,
              });
            
              // The result contains an identifier for the message, `ts`.
              console.log(`Successfully send message ${result.ts} in conversation ${conversationId}`);
            })();
    if (payload.event.type === "app_mention") {
      
        if (payload.event.text.includes("tell me a joke")) {
            
            // Make call to chat.postMessage using bot's token
        }
    }
  const prueba = {
    "me ha llegado": req.body,
    "API": API_SLACK_BOT
  } /*
  res.status(201).json(prueba) */
}