const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");
const Joi = require("@hapi/joi");

const Transcript = db.transcript;

exports.update = (req, res) => {
	try {
		const joiSchema = Joi.object({
			content: Joi.string().required(),
			courseTaskId: Joi.string().required(),
			transcriptId: Joi.string().optional()
		});
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			});
		} else {
			const transcriptObj = {
				content: req.body.content,
				courseTaskId: crypto.decrypt(req.body.courseTaskId)
			};
			const transcriptId = req.body.transcriptId ? crypto.decrypt(req.body.transcriptId) : null;

			Transcript.findOne({ where: { id: transcriptId, isActive: "Y" } })
				.then((response) => {
					if (response) {
						Transcript.update(
							{ content: transcriptObj.content },
							{ where: { id: transcriptId, courseTaskId: transcriptObj.courseTaskId, isActive: "Y" } }
						)
							.then((response) => {
								res.send({ message: "The transcript is updated successfully" });
							})
							.catch((err) => {
								emails.errorEmail(req, err);
								res.status(500).send({
									message: "Some error occurred."
								});
							});
					} else {
						Transcript.create(transcriptObj)
							.then((response) => {
								encryptHelper(response);
								res.status(200).send({ message: "Transcript of Course are created", data: response });
							})
							.catch((err) => {
								emails.errorEmail(req, err);
								res.status(500).send({
									message: "Some error occurred."
								});
							});
					}
				})
				.catch((err) => {
					emails.errorEmail(req, err);
					res.status(500).send({
						message: err.message || "Some error occurred."
					});
				});
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).send({
			message: err.message || "Some error occurred."
		});
	}
};
