
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
    configure: ["configure"],
  },
  users: [],
  grouping: {},
  recomendations: [],
  configuration: false,

}

module.exports.BOT.configure = async (user, message_recived, res) => {
  message_recived = message_recived.split(' ').filter(word=> word !== "gordify" && word !== "configure")
  let msgInit = {
    type: "blocks",
    message:  this.BOT.messageConfig
  }
  try {
    let is_admin = false
    let configStatus = this.BOT.configuration
    
    if (!configStatus) {
      const userInfo = await web.users.info({user})
      is_admin = userInfo.user.is_admin
    }
    
    if (!is_admin) {
      msgInit= {
        type: "text",
        message: 'Lo siento! no tienes permisos de configuración, habla con el Administrador de tu espacio'
      }
    } else if (is_admin && !configStatus){
      configStatus = true      
    } else if (is_admin && configStatus && message_recived.includes('exit')) {
      configStatus = false
      msgInit.message = 'Ok! salimos de la configuración'
    } else if (is_admin && configStatus && message_recived.length > 2) {
      msgInit.message = 'Me has pasado más parámetros, revisa la orden'
    } else if (is_admin && configStatus && message_recived.includes('maxPaxGroups')) {
      this.BOT.maxGroup = message_recived.pop()
      msgInit.message = `He configurado el número máximo de personas por grupo en ${this.BOT.maxGroup}`
    } else if (is_admin && configStatus && message_recived.includes('schudle')) {
      let event = message_recived.pop()
      this.BOT.timer(event)
      msgInit.message = `He configurado el timer en ${event}`      
    } else if (is_admin && configStatus && message_recived.includes('schudleStartAt')) {
      let time = message_recived.pop().split(":")
      this.BOT.timerBot.start = {
        hour: time[0].toString(),
        minutes:  time[1].toString()
      }
      msgInit.message = `He configurado el timer para empezar a las ${time[0]}:${time[1]}`      
    } else if (is_admin && configStatus && message_recived.includes('schudleStopAt')) {
      console.log(user)
      msgInit.message = `He probadond`      
      //
    } 

    const imUSer = await web.im.open({user})    
    this.BOT.sendMessage(imUSer.channel.id, msgInit.type, msgInit.message , res)

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
  
  if (this.BOT.grouping[channel].users.length < 4) {
    this.BOT.grouping[channel].status = false
    msg.message  = `Hoy no se ha apuntado mucha gente, no podemos hacer grupos.... Animaros el próximo día!!!`
  } else if (this.BOT.timerBot.status && this.BOT.grouping[channel].status) {
    msg  = `Estoy programado para parar la busqueda a las ${this.BOT.timerBot.start.hour}:${this.BOT.timerBot.start.minutes} los ${this.BOT.timerBot.days.join(',')}`
  } else if (this.BOT.timerBot.status || !this.BOT.grouping[channel].status) {
    msg.message  = `Aún no he empezado los emparejamientos, si quieres empezar la busqueda de forma manual, habla con el Administrador`
  } else if (this.BOT.grouping[channel] !== undefined && this.BOT.grouping[channel].status === true) {
    this.BOT.grouping[channel].status = false
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

module.exports.BOT.messageConfig =  [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Bienvenido a la configuración de GordifyBot:*"
    }
  },
  {
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "*orden*: desripción \n Escribe `gordify 'orden' 'parametro'` y aplicaré la configuración "
      }
    ]
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":arrow_right: *Numero máximo de personas por grupos*\n\n Configura cuantas personas maximo van por grupo \n\n  *   maxPaxGroups*: Indica un número `gordify maxPaxGroups 5` \n"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":arrow_right: *Temporizador*\n\n Activa/desactiva el temporizador, configure los días y a que hora empieza o termina \n\n  *   schudle start*: Inicia el temporizador \n  *   schudle stop*: Para el temporizador \n  *   schudleStartAt XX:XX*: Fija el inicio de la busqueda a la hora indicada, recuerda indicar la hora en formato 24horas (ejemplo: `gordify schudleStartAt 13:00`) \n  *   schudleStopAt XX:XX*: Fija la finalización de la busqueda a la hora indicada, recuerda indicar la hora en formato 24horas (ejemplo: `gordify schudleStopAt 15:00`) \n  *   SchudleAtDays*: Indica que días iniciaremos la busqueda, recuerda en ingles y separados por una coma (ejemplo `gordify SchudleAtDays monday,friday` \n"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":arrow_right: *Preferencias recomendación de lugares*\n\n Configura ubicación, radio de busqueda en las recomendaciones \n\n  *   locationCoords*: Fija tu ubicación (ejemplo: `gordify location 40.448952,-3.670866`) \n  *   locationRadius*: Fija el radio de de la busqueda de lugares, recuerda ponerlo en metros (ejemplo: `gordify locationRadius 500`) \n"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": ":arrow_right: *Salir de la configuración*\n\n  *   exit*: Sales de la configuración\n"
    }
  },
  {
    "type": "divider"
  }
]