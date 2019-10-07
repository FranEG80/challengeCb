const bot = require('../bot.config')
const axios = require('axios');


const res = { ok: true,
  channel: 'CNR6HNK7X',
  ts: '1570477032.001800',
  message:
   { type: 'message',
     subtype: 'bot_message',
     text: 'Lo siento no se que quieres decirme.',
     ts: '1570477032.001800',
     username: 'gordify',
     bot_id: 'BNT3YG8R5' },
  response_metadata:
   { scopes: [ 'identify', 'bot:basic' ],
     acceptedScopes: [ 'chat:write:bot', 'post' ] } }

let req = {
  "token": "EYVXnILwbfrT3GSQsjTJeagi",
  "team_id": "TG4CABDGQ",
  "api_app_id": "ANCDSVBFC",
  "event": {
    "client_msg_id": "aabce9bc-310f-488d-b919-680bb71175d5",
    "type": "message",
    "text": "@gordify yo",
    "user": "UG51B0XED0dfd06",
    "ts": "1569436286.001200",
    "team": "TG4CABDGQ",
    "channel": "CNR6HNK7X",
    "event_ts": "1569436286.001200",
    "channel_type": "channel"
  },
  "type": "event_callback",
  "event_id": "EvNCEVV55Y",
  "event_time": 1569436286,
  "authed_users": [
    "UNQPY9RQC"
  ]
}



describe('Pruebas del bot Slack', ()=>{
  let mention = "app_mention"
  let noMention =  "no_mention"

  test(`Es una mencion -- ${mention}`, ()=>{
    expect(bot.BOT.isMentioned(mention)).toBeTruthy()
  })
  test(`No es una mencion -- ${noMention}`, ()=>{
    expect(bot.BOT.isMentioned(noMention)).toBeFalsy()
  })

})


test('Mensajes desde Slack recibido por API BOT', (done) => {
  return axios.post('http://127.0.0.1:3000/', req)
    .then(response => {
      expect(response.data).toEqual('OK')
      expect(response.status).toEqual(200)
      done()
    .catch(e=>{
      done(e)
    })
  })
})