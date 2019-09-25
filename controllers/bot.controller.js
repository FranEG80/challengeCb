

const API_SLACK_BOT = process.env.API_SLACK_BOT || 'api_slack_bot'

module.exports.command = (req, res, next) => {

  let payload = req.body;
    res.sendStatus(200);

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