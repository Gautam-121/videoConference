const CustomerModel =  require("../models/customerApprochModel")
const ErrorHandler = require("../utils/errorHandler")

const createCustomerData = async(req,res,next)=>{
    try {
        const data = await CustomerModel.create(req.body)
        return res.status(200).json({
            success: true,
            data
        })
    } catch (error) {
        return next(new ErrorHandler(error.message , 500))
    }
}

module.exports = {createCustomerData}