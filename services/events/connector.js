const amqp = require('amqplib');

const rabbitUrl = 'amqp://localhost'; // Change if your RabbitMQ is hosted elsewhere

async function connectRabbitMQ() {
  try {
    const conn = await amqp.connect(rabbitUrl);
    const channel = await conn.createChannel();
    return { conn, channel };
  } catch (error) {
    console.error('Error connecting to RabbitMQ:', error);
  }
}

module.exports = connectRabbitMQ;
