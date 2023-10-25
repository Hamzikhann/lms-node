module.exports = {
	projectName: process.env.PROJECT_NAME,

	host: process.env.HOST,
	port: process.env.PORT,

	crypto: {
		algorithm: process.env.CRYPTO_ALGORITHM,
		password: process.env.CRYPTO_PASSWORD
	}
};
