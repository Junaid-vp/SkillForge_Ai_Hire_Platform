import { createClient } from "redis";

export const redis = createClient({
  url: "redis://localhost:6379",
});

redis.on("error", (err) => {
  console.log(err, "Error In Redis");
});

export const startRedisServer = async ()  =>  {
  try {
    await redis.connect();
    console.log("Redis Server is Started");
  } catch (e) {
    console.log(e, "Redis Server Start Issue");
  }
};

