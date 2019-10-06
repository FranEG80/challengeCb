
const botConfig = require('../config/bot.config')
const {sendMessage,
   initGroup,
   stoppingGroup, 
   isInTheKeys,
   isMentioned,
   addingGroup,
////creatingGroups
  } = botConfig.BOT

const template = [
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "Hello, Assistant to the Regional Manager Dwight! *Michael Scott* wants to know where you'd like to take the Paper Company investors to dinner tonight.\n\n *Please select a restaurant:*"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Farmhouse Thai Cuisine*\n:star::star::star::star: 1528 reviews\n They do have some vegan options, like the roti and curry, plus they have a ton of salad stuff and noodles can be ordered without meat!! They have something for everyone here"
    },
    "accessory": {
      "type": "image",
      "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c7ed05m9lC2EmA3Aruue7A/o.jpg",
      "alt_text": "alt text for image"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Kin Khao*\n:star::star::star::star: 1638 reviews\n The sticky rice also goes wonderfully with the caramelized pork belly, which is absolutely melt-in-your-mouth and so soft."
    },
    "accessory": {
      "type": "image",
      "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/korel-1YjNtFtJlMTaC26A/o.jpg",
      "alt_text": "alt text for image"
    }
  },
  {
    "type": "section",
    "text": {
      "type": "mrkdwn",
      "text": "*Ler Ros*\n:star::star::star::star: 2082 reviews\n I would really recommend the  Yum Koh Moo Yang - Spicy lime dressing and roasted quick marinated pork shoulder, basil leaves, chili & rice powder."
    },
    "accessory": {
      "type": "image",
      "image_url": "https://s3-media2.fl.yelpcdn.com/bphoto/DawwNigKJ2ckPeDeDM7jAg/o.jpg",
      "alt_text": "alt text for image"
    }
  },
  {
    "type": "divider"
  },
  {
    "type": "actions",
    "elements": [
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Farmhouse",
          "emoji": true
        },
        "value": "click_me_123"
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Kin Khao",
          "emoji": true
        },
        "value": "click_me_123"
      },
      {
        "type": "button",
        "text": {
          "type": "plain_text",
          "text": "Ler Ros",
          "emoji": true
        },
        "value": "click_me_123"
      }
    ]
  }
]


module.exports.slack = (req, res, next) => { 
////// Url verification
  req.body.type === "url_verification"  && res.json(req.body) && res.sendStatus(200)
 
  const payload = req.body.event

  let {type, subtype, channel, text, user } = payload;

//////console.log(req.body.event_id, '******************* ')
//////console.log(req.body.event_time, 'sdafasdf***** ')

  
//// detecting if is a new message or edited message
  let message_recived = (subtype === "message_changed") ? payload.message.text.toLowerCase() :  text.toLowerCase();

////// PARA REFACTORIZAR ---------------------------------
////// buscar como conseguir nombre del bot y cambiarlo en los includes
  if(subtype === "bot_message" || !message_recived.includes('gordify')) { 
    res.sendStatus(200)
    console.log(`This message is ignored`)
  } else if (isInTheKeys("run", isMentioned(type), message_recived)) {
    sendMessage(channel, "text", initGroup(channel), res);
  } else if (isInTheKeys("stop", isMentioned(type), message_recived)){
    stoppingGroup(channel, res)
  } else if (isInTheKeys("addToGroup", isMentioned(type), message_recived)) {
    sendMessage(channel, "text", addingGroup(channel, user), res);
  } else if (isMentioned(type) || message_recived.includes('gordify')) {
    sendMessage(channel, "text", 'Lo siento no se que quieres decirme.', res);
  }
}