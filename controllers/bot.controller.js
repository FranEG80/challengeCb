const createError = require('http-errors')

module.exports.command = (req, res, next) => {
  const prueba = {"me ha llegado": req.body}

  res.status(201).json(prueba)
}