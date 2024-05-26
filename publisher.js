const amqp = require('amqplib');

const message = {
    description: "This is a test message."
}

const data = require("./data.json");

const queueName = process.argv[2] || "QueueJobs";


/**
 * Asynchronously connects to a RabbitMQ server and publishes a JSON message
 * to a specified queue for each user in the data.json file.
 *
 * @return {Promise<void>} Promise that resolves when all messages have been sent.
 * @throws {Error} If there is an error connecting to the server or creating the
 * queue.
 */
(async function () {
    try {
        const connection = await amqp.connect("amqp://@localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertQueue(queueName);

        const messages = data.map(i => {
            message.description = i.id;
            return channel.sendToQueue(queueName, Buffer.from(JSON.stringify(message)));
        });

        await Promise.all(messages);
        console.log(`${data.length} Users Sent`);
    } catch (error) {
        console.error("Error", error);
    }
})();
