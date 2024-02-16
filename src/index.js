const express = require("express")
const app = express()
const cors = require("cors")
const {connection} = require("./config/database.js")
const errorMiddleware = require("./middleware/error.js")
const dotenv = require("dotenv").config()

app.use(express.json())
app.use(cors())

// Connecting To Database
connection()

// Routes Imports
const meetingRouter = require("./routes/meetingRoute.js")
const adminRouter = require("./routes/AdminRoute.js")
const saleUserRouter = require("./routes/SalesUserRoute.js")
const userRouter = require("./routes/UserRoutes.js")

app.use("/api/v1", meetingRouter)
app.use("/api/v1", adminRouter)
app.use("/api/v1", saleUserRouter)
app.use("/api/v1", userRouter)

// Handling Uncaught Exceprtion Error
process.on("uncaughtException" , (err)=>{
    console.log(`Error: ${err.message}`)
    console.log(`Shutting down the server due to uncaught Exception`)
    process.exit(1)
})

//Middleware for error
app.use(errorMiddleware)

const server = app.listen(process.env.PORT || 8081 , ()=>{
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


