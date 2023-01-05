const mqtt = require('mqtt');
const fs = require('fs');
const path = require('path');

const options = {
  host: '192.144.234.153',
  port: 8883,
  username: 'user1080',
  password: '123456',
  connectTimeout: 4000,
  clientId: 'display-' + Math.random().toString(16).substring(2, 8),
  keepalive: 30,
  clean: true,
};

const client = mqtt.connect(options);

function subscribe() {
  console.log(client.options.clientId, 'connect');
  client.subscribe('/client/+/action/#', () => {
    console.log(client.options.clientId, 'subscribe');
  });
}

client.on('connect', subscribe);

client.on('reconnect', subscribe);

client.on('error', err => {
  console.log(client.options.clientId, 'error', err);
});

client.on('end', () => {
  console.log(client.options.clientId, 'close');
});

client.on('message', (topic, payload) => {
  const message = JSON.parse(Buffer.from(payload.toString(), 'base64').toString('utf-8'));

  const regExp = new RegExp(/\/client\/(.*)\/action\/(.*)/);
  const matchs = topic.match(regExp);
  const apiKey = matchs[1];
  const action = matchs[2];

  console.log(topic, message);

  if (handles[action]) {
    handles[action]({ ...message, apiKey });
  }
});

function display_reply(message) {
  console.log(message);
}

function online(message) {
  console.log(message);
}

function offline(message) {
  console.log(message);
}

function button(message) {
  console.log(message);
  display(message.mac, message.apiKey);
}

function cmd_display(mac, apiKey) {
  const data = fs.readFileSync(path.join(__dirname, 'images/test.png'));
  const imgsrc = 'data:image/png;base64,' + data.toString('base64');

  return {
    method: 'display',
    msgId: `${new Date().getTime()}`,
    apiKey: apiKey,
    version: 1,
    message: {
      mac: mac,
      imgsrc: imgsrc,
      algorithm: 'binarization',
    },
  };
}

function display(mac, apiKey) {
  const payload = cmd_display(mac, apiKey);
  const topic = `/client/${apiKey}/action/display`;

  client.publish(topic, Buffer.from(JSON.stringify(payload)).toString('base64'));
}

const handles = {
  online,
  offline,
  button,
  display_reply,
};
