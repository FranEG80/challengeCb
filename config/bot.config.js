
const { WebClient } = require('@slack/web-api');
const token = process.env.TOKEN_SLACK_BOT
const web = new WebClient(token);

//////////////// Create parseo users
let userParseo = { 'UG51B0XPD': { leader: 0 } }
for (i = 0; i <= 20; i++) {
  newUser =
    userParseo[`UG51B0XED0dfd0--${i}`] = { leader: Math.floor((Math.random() * (3 - 0)) + 0) }
}

module.exports.BOT = {
  botName: 'gordify',
  maxGroup: 7,
  keys: {
    run: ["start", "go"],
    stop: ["stop", "end"],
    addToGroup: ["yo", "voy", "apuntame"],
    removeToGroup: ["no voy", "quitame", "desapuntame", "no puedo ir"],
    configure: ["configure"],
  },
  users: userParseo,
  grouping: {},

}

module.exports.BOT.isMentioned = type => type === "app_mention"

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
//////const botInfo = await web.mpim.open({ users });
//////const channelInfo = await web.channels.info({ channel })
    const result = await web.chat.postMessage({
      [event]: message,
      channel: channel // botInfo.group.id,
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

  let msg = 'apuntate reaccionando a mi mensaje o diciendome que te apuntas'

  if (this.BOT.grouping[channel] !== undefined && this.BOT.grouping[channel].status) {
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

  if (this.BOT.grouping[channel] !== undefined && this.BOT.grouping[channel].status === true) {
    this.BOT.grouping[channel].status = false
    msg = this.BOT.creatingGroups(channel, this.BOT.grouping[channel].users)
  }

  this.BOT.sendMessage(channel, msg.type, msg.message, res)
}

module.exports.BOT.addingGroup = (channel, user, res) => {

  let msg = `Ey!!! ya contaba contigo <@${user}> :smile::smile::smile:`

  if (this.BOT.grouping[channel] === undefined || !this.BOT.grouping[channel].status) {
    msg = `<@${user}> no estamos organizando los grupos! prueba a inciar la búsqueda con *gordify start*`
  } else if (!this.BOT.grouping[channel].users.includes(user)) {
    ///////////// añadir a la lista de users   
    this.BOT.grouping[channel].users = [...this.BOT.grouping[channel].users, user]

    ////////////////// QUITAR!!!!!!! ----------------------- UG51B0XED0dfd06
    //////////////// Create parseo users
    for (i = 0; i < 10; i++) {
      this.BOT.grouping[channel].users = [...this.BOT.grouping[channel].users, `UG51B0XED0dfd0--${i}`]
    }
    //////////////// Create parseo users
    msg = `Ok <@${user}> te apunto a la lista de los grupos!! :smile:`
  } 
  this.BOT.sendMessage(channel, 'text', msg, res)
}

module.exports.BOT.creatingGroups = (channel, users, res) => {

  /////// elegir leader sin repetir --------------------------
  users.sort((a, b) => this.BOT.users[a].leader - this.BOT.users[b].leader)

  let groupsChannel = this.BOT.grouping[channel]
  let numGroups = Math.floor(users.length / this.BOT.maxGroup)

  if (this.BOT.users[channel] === undefined) this.BOT.users[channel] = []
  if (users.length % this.BOT.maxGroup !== 0) numGroups++

  let numUsers = Math.floor(users.length / numGroups)

  for (i = 1; i <= numGroups; i++) {
    user = groupsChannel.users.shift()
    groupsChannel.actualGroups = [...groupsChannel.actualGroups, { leader: user, users: [user] }]
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

  return {
    message: template,
    type: 'blocks'
  }

}

module.exports.BOT.configure = async (user, res) => {
  try {
    let msg='Lo siento! no tienes permisos de configuración, habla con el Administrador de tu espacio'
    const userInfo = await web.users.info({user})
    
    if (!userInfo.user.is_admin){
      msg = "Bienvenido a la configuración!!"
    }

    const imUSer = await web.im.open({user})
    
    this.BOT.sendMessage(imUSer.channel.id, "text", msg, res)

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