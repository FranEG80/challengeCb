
const { WebClient } = require('@slack/web-api');

const botConfig = require('../config/bot.config')
const BOT = botConfig.BOT

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
 
// Read a token from the environment variables
const token = process.env.TOKEN_SLACK
 
// Initialize
const web = new WebClient(token);

module.exports.command = (req, res, next) => {  
  let payload = req.body;
    res.sendStatus(200);
    console.log(payload)
    if ((payload.event.type === "app_mention" && payload.event.text.includes("start")) || payload.event.text.includes("gordify start")) {
      web.chat.postMessage({
        text: "eyeyeyeyeyeyyeyeyeyeyeyeye",
        channel: payload.event.channel,
      })
    } else if(payload.event.subtype && payload.event.subtype === "bot_message") {
      
    } else if (payload.event.text.includes("gordify")){
      (async () => {
        
        const result = await web.chat.postMessage({
          text: "eyeyeyeyeyeyyeyeyeyeyeyeye",
          blocks: template,
          channel: payload.event.channel,
        });

        console.log(`Successfully send message ${result.ts} in conversation #${result.channel}`);
      })();
    }

}