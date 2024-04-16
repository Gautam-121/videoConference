const nodemailer = require("nodemailer")

const sendEmail = async({email , subject , message})=>{

    const transporter = nodemailer.createTransport({
        host:process.env.SMPT_HOST,
        port:process.env.SMPT_PORT,
        service:process.env.SMPT_SERVICE,
        secure:false,
        auth:{
            user:process.env.SMPT_EMAIL,
            pass:process.env.SMPT_PASS
        }
    })

    await transporter.sendMail({
        from:process.env.SMPT_EMAIL,
        to:email,
        subject: subject,
        text: message
    })
}

module.exports = sendEmail