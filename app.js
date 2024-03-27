const express = require("express")
const cors = require("cors")
const errorMiddleware = require("./middleware/error.middleware.js")
require("dotenv").config({path:"./.env"})

const app = express()

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({extended: true}))

// Routes Imports
const meetingRouter = require("./routes/meeting.routes.js")
const saleUserRouter = require("./routes/salesUser.routes.js")

app.get("/", (req,res,next)=>{
    return res.status(200).json({
        success: true,
        message: "Deployed Successfully"
    })
})

//routes declaration
app.use("/api/v1/meeting", meetingRouter)
app.use("/api/v1/sales", saleUserRouter)

//Middleware for error
app.use(errorMiddleware)

module.exports = app