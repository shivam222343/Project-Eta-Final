import Redis from 'ioredis';


const redisClient = new Redis({
    host: "redis-15163.c57.us-east-1-4.ec2.redns.redis-cloud.com",
    port: 15163,
    password: "DeSYqVADX81SsLltHJ6Op5RpWgFaFnk7"
});

redisClient.on('connect', () => {
    console.log('Redis connected');
})

export default redisClient;