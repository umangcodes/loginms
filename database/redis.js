const redis = require('redis');

const connectRedis = async () => {
  const redisUrl = `redis://${process.env.REDIS_PWD}@${process.env.REDIS_URL}`;
  console.log(redisUrl)
  console.log("connecting to redis")
  const redisClient = await redis.createClient({
    url: redisUrl
  })

  redisClient.on("error", (error) => { console.error("Redis Error: ", error);
  });

  redisClient.on("connect", () => { console.log("Connected to Redis Cloud successfully!");
  });

  return redisClient;
};

module.exports = {
  connectRedis
}