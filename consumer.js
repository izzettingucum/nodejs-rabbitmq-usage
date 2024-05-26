const amqp = require('amqplib');
const data = require("./data.json");

const queueName = process.argv[2] || "QueueJobs";

/**
 * Asynchronously connects to a RabbitMQ server and starts consuming messages
 * from a specified queue.
 *
 * @return {Promise} A promise that resolves when the connection is established
 * and the consumer is ready to receive messages.
 * @throws {Error} If there is an error connecting to the server or creating the
 * queue.
 */

(async function () {
    try {
        const connection = await amqp.connect("amqp://@localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);

        console.log("Waiting for messages...", queueName);

        channel.consume(queueName, (message) => handleMessage(message, channel));
    } catch (error) {
        console.error("Error", error);
    }
})();

/**
 * Handles a message received from a RabbitMQ channel.
 *
 * @param {Object} message - The message object received from the channel.
 * @param {Object} channel - The RabbitMQ channel.
 * @return {void} This function does not return anything.
 */

function handleMessage(message, channel) {
    try {
        const messageInfo = JSON.parse(message.content.toString()); 
        const userInfo = data.find(user => user.id == messageInfo.description);
        
        console.log(userInfo ? "Processed Record" : "Empty", userInfo);
        channel.ack(message);
    } catch (error) {
        console.error("An error occurred while processing the message", error);
    }
}
