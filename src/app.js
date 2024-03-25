const express = require("express")
const cors = require("cors")
const errorMiddleware = require("./middleware/error.middleware.js")
require("dotenv").config({path:"./.env"})

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Routes Imports
const meetingRouter = require("./routes/meeting.routes.js")
const saleUserRouter = require("./routes/salesUser.routes.js")

//routes declaration
app.use("/api/v1/meeting", meetingRouter)
app.use("/api/v1/sales", saleUserRouter)

//Middleware for error
app.use(errorMiddleware)

module.exports = app