module.exports = {
	projectName: process.env.PROJECT_NAME,

	host: process.env.HOST,
	port: process.env.PORT,

	frontend_URL: process.env.FRONTEND_URL,

	crypto: {
		algorithm: process.env.CRYPTO_ALGORITHM,
		password: process.env.CRYPTO_PASSWORD
	},

	email: {
		send: process.env.EMAIL_SEND,
		sender: {
			success: process.env.EMAIL_SEND_SUCCESS,
			error: process.env.EMAIL__SEND_ERROR
		}
	}
};
