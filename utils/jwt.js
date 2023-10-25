const jwt = require("jsonwebtoken");

exports.signToken = (data, expiresIn = process.env.JWT_EXPIRES_IN) => {
	return jwt.sign(data, process.env.JWT_SECRET, { expiresIn });
};

exports.protect = async (req, res, next) => {
	let token;
	let authHead = req.headers.Authorization || req.headers.authorization;
	if (authHead && authHead.startsWith("Bearer")) {
		token = authHead.split(" ")[1];
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				res.status(401).json({ message: "There is some problem with the token" });
			}
			req.user = decoded.user;
			next();
		});
		if (!token) {
			res.json({ message: "the token is missing" }).status(401);
		}
	}
};

exports.resetPasswordProtect = (req, res, next) => {
	const token = req.params.token;

	if (token) {
		jsonwebtoken.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			if (err) {
				res.status(440).send({
					message: err.message || "Session has been expired."
				});
			} else {
				Object.assign(req, {
					userId: decoded.userId,
					profileId: decoded.profileId,
					clientId: decoded.clientId,
					roleId: decoded.roleId,
					email: decoded.email
				});
				next();
			}
		});
	} else {
		res.status(400).send({
			message: "No Access Token"
		});
	}
};
