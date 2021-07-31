const nodemailer = require('nodemailer');
const {google} = require('googleapis');
const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLEAPI_CLIENT_ID, process.env.GOOGLEAPI_CLIENT_SECRET, process.env.GOOGLEAPI_REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: process.env.GOOGLEAPI_REFRESH_TOKEN});

module.exports.sendVerificationEmail = async (link, email, firstName) => {

    try {
        var htmlString = '<!DOCTYPE html><html><head><title>Email Verification</title><style type="text/css">body{font-family: verdana;}</style></head><body style="background-color: #fff; margin: 0 auto;"><center><table style="width: 100%; background-color: #; margin: 0 auto;"><tr><th><h1 style="background-color: red; color: white; padding: 10px;">FMR E-Learning</h1></th></tr><tr><td style="font-size: 18px;"><h2 style="color: grey; text-align: center;">Hi ' + firstName + '</h2><p style="text-align: center; font-family: sans-serif;">Please click on the button below to verify your email address.</p><center><a href="' + link + '"><button style="background-color: red;color: white;border: none;width: 150px;height: 50px; font-size: 15px; font-weight: bold;border-radius: 10px;">Verify Account</button></a></center></td></tr></table></center></body></html>';
        const accessToken = await oAuth2Client.getAccessToken;

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            // host: "smtp.ethereal.email",
            // port: 465,
            // secure: true, // true for 465, false for other ports
            auth: {
                type: 'OAuth2',
                user: 'godwintrav@gmail.com',
                clientId: process.env.GOOGLEAPI_CLIENT_ID,
                clientSecret: process.env.GOOGLEAPI_CLIENT_SECRET,
                refreshToken: process.env.GOOGLEAPI_REFRESH_TOKEN,
                accessToken: accessToken
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: '"FMR E-Learning 👻" <fmr-elearning@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Verify Email Address ✔", // Subject line
            text: "Verify Email Address click the link " + link, // plain text body
            html: htmlString, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        //console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

    }catch(error){
        throw Error(error.message);
    }

}

