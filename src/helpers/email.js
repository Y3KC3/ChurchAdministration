const nodemailer = require('nodemailer');

module.exports = (title,description,emails) => {
    var transporte = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: "melvincolmenares.m@gmail.com",
            pass: "unyyqxzerxikdgbh"
        }
    });
    
    var emailOption = {
        from: '"Caminando En Lo Sobrenatural" <melvincolmenares.m@gmail.com>',
        to: emails.toString(),
        subject: title,
        html: description
    };
    
    transporte.sendMail(emailOption, (error,info) => {
        if (error) { console.log('There is a problem with the shipment', error.message); return false }
        else console.log('The email has been sent'); return true;
    });
};