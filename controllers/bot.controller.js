
const botConfig = require('../config/bot.config')
const {sendMessage,
   initGroup,
   stoppingGroup, 
   isInTheKeys,
   isMentioned,
   addingGroup,
   configure,
   botName,
  } = botConfig.BOT


module.exports.slack = (req, res, next) => { 
  
////// Url verification
  req.body.type === "url_verification"  && res.json(req.body) && res.sendStatus(200)
 
  const payload = req.body.event

  let {type, subtype, channel, text, user } = payload;


  
//// detecting if is a new message or edited message
  let message_recived = (subtype === "message_changed") ? payload.message.text.toLowerCase() :  text.toLowerCase();

////// PARA REFACTORIZAR ---------------------------------
////// buscar como conseguir nombre del bot y cambiarlo en los includes
  if(subtype === "bot_message" || !message_recived.includes(botName)) { 
    res.sendStatus(200)
    console.log(`This message is ignored`)
  } else if (isInTheKeys("run", isMentioned(type), message_recived)) {
    initGroup(channel, res);
  } else if (isInTheKeys("stop", isMentioned(type), message_recived)){
    stoppingGroup(channel, res)
  } else if(isInTheKeys("configure", isMentioned(type), message_recived)) {
    configure(user, res);
  } else if (isInTheKeys("addToGroup", isMentioned(type), message_recived)) {
    addingGroup(channel, user, res);
  } else if (isMentioned(type) || message_recived.includes('gordify')) {
    sendMessage(channel, "text", 'Lo siento no se que quieres decirme.', res);
  }
}