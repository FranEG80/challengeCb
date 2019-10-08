let cron = require('node-cron')
 
module.exports.task = (hour, minutes, days, timezone) => {  
  return cron.schedule(`* ${minutes} ${hour} * * ${days.join(",")}`, () => {
    console.log(`Runing a gordify at ${hour}:${minutes} at ${days.join(",")} at ${timezone} timezone`);
  }, {
    scheduled: true,
    timezone,
  });

}