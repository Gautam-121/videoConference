const app = require("./app.js")
const {client} = require("./constant.js")
const {connectDB} = require("./config/db.js")
require("dotenv").config({path:"./.env"})


process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to uncaught Exception`)
    process.exit(1)
})

client.on('connect', () => {
    console.log('MQTT client connected successfully');
});

  
client.on('error', (error) => {
    console.log(`Cannot connect Error:`, error);
});
  
connectDB()
.then(() => {
    const server = app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })

    process.on("unhandledRejection" , (err)=>{
        console.log(`Error: ${err.message}`)
        console.log(`Shutting down the server due to Unhandled Promise Rejection`);
    
        server.close(()=>{
            process.exit(1)
        })
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})







