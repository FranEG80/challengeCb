# challengeCb

_Slackbot creado para el challege de Cabify, programado para organizar los viernes grupos para ir a comer_

Este bot comienza a buscar los viernes a las 10 y termina a las 12 de forma automática, no obstante, si quieres hacerlo manual puedes cambiar en _config > bot.config.js > BOT.timerBot.status_ a false.

Si lo pones manual podrás iniciarlo, apuntarte o pararlo con varias palabras nombrando al bot con @ o solo diciendo su nombre, las palabras están en _config > bot.config.js > BOT.keys_

```
keys: {
    run: ["start", "go"],
    stop: ["stop", "end"],
    addToGroup: ["yo", "voy", "apuntame"],
    removeToGroup: ["no voy", "quitame", "desapuntame", "no puedo ir"],
  }

```

## Comenzando 🚀

_Estas instrucciones te permitirán obtener una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas._


### Pre-requisitos 📋

_1. Tienes que tener instalado NodeJS_

_2. Como entorno de prueba he usado ngrok para abrir un tunel a la dirección local_

_3. Crear en tu espacio de trabajo una app-slack_




### Instalación 🔧

_Crea una carpetaClonate mi respositorio y inicia el proyecto descargando los módulos_

```
$ git clone https://github.com/FranEG80/challengeCb.git
$ cd cbChallenge
$ npm i
```

_Ten en cuenta que se usa las siguientes variables de entorno_

El tokeen de slack lo tienes en tu slack-app creada en el apartado OAuth & Permissions

```
TOKEN_SLACK_BOT = [YOUR_TOKEN_SLACK_BOT]

GOOGLE_API_PLACE = [YOUR_TOKEN_GOOGLE_API_PLACE]
```

_Sigue las instrucciones para descargar, instalar y ejecutar ngrok en el puerto 3000_

```
install --> https://dashboard.ngrok.com/get-started
```

```
$ ./ngrok token [YOUR_TOKEN_NGROK]
$ ./ngrok http 3000
```
_Crea una slack-app en https://api.slack.com/apps_

Llama a la app gordify y marca los accesos a:
   *Incoming Webhooks
   *Bots
   *Event Subcriptions
   *Permission

_Copia la dirección virtual dada por ngrok y ponla en tu slack-app en Event Subscriptions_

_Añade los siguientes eventos en Event Subscription_

```
app_mention - Subscribe to only the message events that mention your app or bot

im_open - You opened a DM

message.channels - A message was posted to a channel

message.im - A message was posted in a direct message channel
```

_Configura en OAuth & Permissions en la app-slack creada_

```
CONVERSATIONS	
Send messages as gordify

chat:write:bot
Send messages as user

chat:write:user
Access information about user’s direct messages

im:read
Modify user’s direct messages

im:write
Post to specific channels in Slack

incoming-webhook
INTERACTIVITY	
Add a bot user with the username @gordify

bot
Add slash commands and add actions to messages (and view related content)

commands
USER GROUPS	
Access basic information about the workspace’s User Groups

usergroups:read
Change user’s User Groups

usergroups:write
USERS	
Access your workspace’s profile information

users:read
Access user’s profile and workspace profile fields

users.profile:read
```


---
⌨️ por [Fran Enríquez](https://github.com/FranEG80) 😊
