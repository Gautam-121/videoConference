const connectOptions = {
    protocol: 'mqtts',
    port: 8883,
    host: 'broker.emqx.io',
}

const clientId = 'emqx_nodejs_' + Math.random().toString(16).substring(2, 8);
const options = {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'emqx_test1',
  password: 'emqx_test1',
  reconnectPeriod: 1000,
};

let connectUrl = `${connectOptions.protocol}://${connectOptions.host}:${connectOptions.mqttPort}`;

if (['ws', 'wss'].includes(connectOptions.protocol)) {
  connectUrl += '/mqtt';
}

module.exports = {connectUrl , options}