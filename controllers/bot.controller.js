const createError = require('http-errors')

const API_SLACK_BOT = process.env.API_SLACK_BOT || 'api_slack_bot'

module.exports.command = (req, res, next) => {
  const prueba = {
    "me ha llegado": req.body,
    "API": API_SLACK_BOT
  }
  console.log(JSON.stringify(prueba))
  res.status(201).json(prueba)
}