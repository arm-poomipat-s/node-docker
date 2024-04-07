const express = require("express");
const mongoose = require("mongoose");
const redis = require('redis');
const session = require('express-session');
const RedisStore = require("connect-redis").default;
const cors = require('cors');

const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  REDIS_URL,
  SESSION_SECRET,
  REDIS_PORT,
} = require("./config/config");

// Initialize client.
let redisClient = redis.createClient({
  socket: {
    host: REDIS_URL,
    port: REDIS_PORT
  },
})
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient
})



const postRouter = require("./routes/postRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("connected to DB");
  } catch (error) {
    console.error(error);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();
app.use(express.json());

app.enable("trust proxy");
app.use(cors());

// Initialize sesssion storage.
app.use(
  session({
    store: redisStore,
     // required: force lightweight session keep alive (touch)
     // recommended: only save session when data exists
    secret: SESSION_SECRET,
    cookie: {
      secure: false,
      resave: false, // recommended: only set cookies over https. In production you should use secure:true
      httpOnly: true,
      saveUninitialized: false, // recommended: don't let JS code access cookies. Browser extensions run JS code on your browser!
      maxAge: 30000 // set this to 30 seconds or less  
    }    
  })
)



app.get("/api/v1", (req, res) => {
  res.send("<h2>Hello Arm</h2>");
  console.log("yeah it ran");
});

//localhost:3000/api/v1/post/
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/users", userRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
