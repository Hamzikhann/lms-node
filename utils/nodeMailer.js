const nodemailer = require("nodemailer");
const secrets = require("../config/secrets");

const emailSend = secrets.email.send;

async function nodeMailer(mailOptions) {
	if (emailSend == 1) {
		const transporter = await nodemailer.createTransport({
			host: "smtp.sendgrid.net",
			port: 465,
			auth: {
				user: "apikey",
				pass: process.env.SENDGRID_API_KEY
			}
		});

		try {
			await transporter.verify();
		} catch (error) {
			throw error;
		}

		const info = await transporter.sendMail(mailOptions);
		console.log("Email sent to ", mailOptions.to, info);
		return info;
	} else {
		return 1;
	}
}

module.exports = nodeMailer;
