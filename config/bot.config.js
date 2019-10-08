
const { WebClient } = require('@slack/web-api');
const token = process.env.TOKEN_SLACK_BOT
const web = new WebClient(token);

const cron = require('./cron.config')
const services = require('../services/google.service')

module.exports.BOT = {
  preferencesRecomendation: {
    locationOffice: "40.448952, -3.670866",
    radius: "500",
  },
  timerBot: {
    status: false, 
    timezone: "Europe/Madrid",
    start: {
      hour: '10',
      minutes: '00'
    },
    stop: {
      hour: '12',
      minutes: '00'
    },
    days: ['Friday']
  },
  botName: 'gordify',
  maxGroup: 7,
  keys: {
    run: ["start", "go"],
    stop: ["stop", "end"],
    addToGroup: ["yo", "voy", "apuntame"],
    removeToGroup: ["no voy", "quitame", "desapuntame", "no puedo ir"],
  },
  users: [],
  grouping: {},
  recomendations: [],

}

module.exports.BOT.isMentioned = type => type === "app_mention"

module.exports.BOT.timer = action => {
  let {start, days, timezone, status} = this.BOT.timerBot
  if (action === "start"){
    this.BOT.timerBot.status = true
    cron.task(start.hour, start.minutes, days, timezone ).start()
  } else if (action === "stop") {
    this.BOT.timerBot.status = false
    cron.task(start.hour, start.minutes, days, timezone  ).stop()
  }
}

module.exports.BOT.isInTheKeys = (inputKey, mentioned, message_recived) => {
  let keys = [...this.BOT.keys[inputKey]]
  if (!mentioned) { keys = [...this.BOT.keys[inputKey]].map(el => ["gordify ", el].join("")) }
  return keys.reduce((acc, el) => {
    if (message_recived.normalize('NFD').replace(/[\u0300-\u036f]/g, "").includes(el)) {
      return acc + 1
    } else {
      return acc
    }
  }, 0) > 0
}

module.exports.BOT.sendMessage = async (channel, event, message, res) => {
  
  res.sendStatus(200);

  try {
    const result = await web.chat.postMessage({
      [event]: message,
      channel: channel 
    })
    console.log(`Successfully send message ${result.ts} in conversation ${channel}`);
  } catch (error) {
    if (error.code !== undefined) {
      console.log({
        Error: error.code,
        Data: error.data
      });
    } else {
      console.log('Well, that was unexpected.');
    }
  }
}

module.exports.BOT.initGroup = (channel, res) => {
  services.request(this.BOT.preferencesRecomendation.locationOffice, this.BOT.preferencesRecomendation.radius)
    .then(resp=>{
      let result = resp.data.results
      let recomendation = result.sort(()=>Math.floor(Math.random() * (result.length - 0)) + 0).slice(0,5)
      this.BOT.recomendations = recomendation.map(el=>{
        return {
          name: el.name,
          vicinity: el.vicinity,
          rating: el.rating,
          price_level: el.price_level
        }
      })
    })
    .catch(e=> console.log(e))

  let msg = 'apuntate reaccionando a mi mensaje o diciendome que te apuntas'
  if (this.BOT.timerBot.status) {
    msg  = `Estoy configurado para iniciar el emparejamiento a las ${this.BOT.timerBot.start.hour}:${this.BOT.timerBot.start.minutes}`
  } else if (this.BOT.grouping[channel] !== undefined && this.BOT.grouping[channel].status) {
    msg  = `Ya hemos iniciado los grupos! ${msg}`
  } else {
    this.BOT.grouping[channel] = {
      users: [],
      status: true,
      actualGroups: []
    }
    msg  = `Ok! vamos a buscar los grupos, ${msg}`
  }
  this.BOT.sendMessage(channel, 'text', msg, res)
}

module.exports.BOT.stoppingGroup = (channel, res) => {
  let msg = {
    message: 'No hemos empezado todavía, si quieres escribe *gordify start*',
    type: 'text',
  }
  
  if (this.BOT.timerBot.status && this.BOT.grouping[channel] === undefined) {
    msg.message  = `Aún no hemos empezado, estoy programado para empezar a las ${this.BOT.timerBot.start.hour}:${this.BOT.timerBot.start.minutes} los ${this.BOT.timerBot.days.join(',')}`
  } else if (this.BOT.grouping[channel].users.length < 4) {
    this.BOT.grouping[channel].status = false
    msg.message  = `Hoy no se ha apuntado mucha gente, no podemos hacer grupos.... Animaros el próximo día!!!`
  } else if (this.BOT.timerBot.status && this.BOT.grouping[channel].status) {
    msg  = `Estoy programado para parar la busqueda a las ${this.BOT.timerBot.start.hour}:${this.BOT.timerBot.start.minutes} los ${this.BOT.timerBot.days.join(',')}`
  } else if (this.BOT.timerBot.status || !this.BOT.grouping[channel].status) {
    msg.message  = `Aún no he empezado los emparejamientos, si quieres empezar la busqueda de forma manual, habla con el Administrador`
  } else if (this.BOT.grouping[channel] !== undefined && this.BOT.grouping[channel].status === true) {
    this.BOT.grouping[channel]= {
      status: false,
      users: []
    }
    msg = this.BOT.creatingGroups(channel, this.BOT.grouping[channel].users)
  }

  this.BOT.sendMessage(channel, msg.type, msg.message, res)
}

module.exports.BOT.addingGroup = (channel, user, res) => {

  let msg = `Ey!!! ya contaba contigo <@${user}> :smile::smile::smile:`

  if (this.BOT.timerBot.status && !this.BOT.grouping[channel].status) {
    msg  = `Aún no estoy emparejando, tienes que esperar a las ${this.BOT.timerBot.start.hour}:${this.BOT.timerBot.start.minutes} los ${this.BOT.timerBot.days.join(',')}`
  } else if (this.BOT.grouping[channel] === undefined || !this.BOT.grouping[channel].status) {
    msg = `<@${user}> no estamos organizando los grupos! prueba a inciar la búsqueda con *gordify start*`
  } else if (!this.BOT.grouping[channel].users.includes(user)) {
    (this.BOT.users[user] === undefined) ? this.BOT.users[user] = {leader: 0} : null
    this.BOT.grouping[channel].users = [...this.BOT.grouping[channel].users, user]
    msg = `Ok <@${user}> te apunto a la lista de los grupos!! :note:`
  } 
  this.BOT.sendMessage(channel, 'text', msg, res)
}

module.exports.BOT.removingGroup = (channel, user, res) => {

  let msg = `<@${user}> no puedo quitarte de la lista, no te apuntaste :smile:`

  if (!this.BOT.grouping[channel].status) {
    msg  = `<@${user}> no puedo quitarte de la lista, no te apuntaste y aun no empecé a buscar :stuck_out_tongue_closed_eyes:`
  } else if (this.BOT.grouping[channel].users.includes(user)) {
    msg = `Ohhh!!! Estas seguro? Ok <@${user}> te quito de la lista :note:`
    this.BOT.grouping[channel].users = this.BOT.grouping[channel].users.filter(el => el !== user)
  } 
  this.BOT.sendMessage(channel, 'text', msg, res)
}

module.exports.BOT.creatingGroups = (channel, users, res) => {
  
///////////// Leader
  users.sort((a, b) => this.BOT.users[a].leader - this.BOT.users[b].leader)
  let leaders = []

  let groupsChannel = this.BOT.grouping[channel]
  let numGroups = Math.floor(users.length / this.BOT.maxGroup)

  if (this.BOT.users[channel] === undefined) this.BOT.users[channel] = []
  if (users.length % this.BOT.maxGroup !== 0) numGroups++

  let numUsers = Math.floor(users.length / numGroups)

  for (i = 1; i <= numGroups; i++) {
    user = groupsChannel.users.shift()
    this.BOT.users[user].leader ++
    groupsChannel.actualGroups = [...groupsChannel.actualGroups, { leader: user, users: [user] }]
    leaders = [...leaders, user]
  }

  let template = [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Ey! Hemos se acabó el tiempo para apuntarse a comer!\n\n *Estos son los grupos:*"
      },
    }
  ]

  groupsChannel.actualGroups.forEach((group, i) => {

    if (i < users.length % numGroups) {
      group.users = [...group.users, ...users.splice(0, numUsers)]
    } else {
      group.users = [...group.users, ...users.splice(0, numUsers - 1)]
    }

    let usersGroup = group.users.map(el => `- <@${el}>`).slice(1, group.users.length).join("\n ")

    template = [...template,
    {
      "type": "divider"
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*Grupo ${i + 1} - Lider: <@${group.leader}>* :crown: \n ${usersGroup}`
      }
    }]
  });

  template = [...template, this.BOT.creatingRecomendation()]

  return {
    message: template,
    type: 'blocks'
  }


}

module.exports.BOT.creatingRecomendation = ()=>{
  let initTxt = [{
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": `\n Como se que es difcil buscar un sitio, he buscado por vosotros algunas recomendaciones: \n\n`
    }
  }]
  
  this.BOT.recomendations.forEach(place=>{
    initTxt = [...initTxt, {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `:arrow_forward: *${place.name}* con una puntuación de ${place.rating.toFixed(1)} sobre 5\n *Dirección*: ${place.vicinity}`
        }            
      },
      {
        "type": "divider"
      }]
  })
  return initTxt
}
