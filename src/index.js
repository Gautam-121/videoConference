const express = require("express")
const app = express()
const cors = require("cors")
const {connection} = require("./config/database.js")
const errorMiddleware = require("./middleware/error.js")
require("dotenv").config()
const cookieParser = require("cookie-parser");

app.use(express.json())
app.use(cors(
    {
     "origin": "http://localhost:3000",
     credentials: true
    }
))


app.use(cookieParser());

//Connecting To Database
connection()

// Routes Imports
const meetingRouter = require("./routes/meetingRoute.js")
const saleUserRouter = require("./routes/SalesUserRoute.js")

app.use("/", meetingRouter)
app.use("/", saleUserRouter)

// Handling Uncaught Exceprtion Error
process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to uncaught Exception`)
    process.exit(1)
})

//Middleware for error
app.use(errorMiddleware)

const server = app.listen(process.env.PORT || 3000 , ()=>{
    console.log(`Server running on Port ${process.env.PORT || 8081}`)
})

// Handlling Unhandled Promised Rejection
process.on("unhandledRejection" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to Unhandled Promise Rejection`);

    server.close(()=>{
        process.exit(1)
    })
})




