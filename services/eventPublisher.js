const amqp = require('amqplib/callback_api');

function publishEvent(eventType, eventData) {
  amqp.connect('amqp://localhost', function(error0, connection) {
    if (error0) {
      throw error0;
    }
    connection.createChannel(function(error1, channel) {
      if (error1) {
        throw error1;
      }
      const exchange = 'eventExchange';
      const msg = JSON.stringify(eventData);

      channel.assertExchange(exchange, 'direct', {
        durable: false
      });
      channel.publish(exchange, eventType, Buffer.from(msg));
      console.log(" [x] Sent %s: '%s'", eventType, msg);
    });
  });
}

module.exports = { publishEvent };
