const Joi = require("@hapi/joi");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const db = require("../../models");
const { Configuration, OpenAIApi } = require('openai');
// import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
  apiKey: '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',
});
const openai = new OpenAIApi(configuration);

const CourseTaskAssessmentQuestions = db.courseTaskAssessmentQuestions;

exports.create = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().max(255).required(),
			options: Joi.any().optional(),
			answer: Joi.string().max(255).required(),
			type: Joi.string().required(),
			courseTaskAssessmentId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		}
		const question = {
			title: req.body.title,
			options: req.body.options,
			answer: req.body.answer,
			type: req.body.type,
			courseTaskAssessmentId: crypto.decrypt(req.body.courseTaskAssessmentId)
		};

		CourseTaskAssessmentQuestions.create(question)
			.then(async (response) => {
				encryptHelper(response);
				res.send({
					message: "Assessment question has been created",
					data: response
				});
			})
			.catch(async (err) => {
				emails.errorEmail(req, err);
				res.status(500).json({
					message: err.message || "Some error occurred."
				});
			});
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};

exports.update = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			title: Joi.string().required(),
			options: Joi.any().optional(),
			answer: Joi.string().required(),
			type: Joi.string().required(),
			courseTaskAssessmentQuestionId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const courseTaskAssessmentQuestionId = crypto.decrypt(req.body.courseTaskAssessmentQuestionId);
			const assessmentQuestion = {
				title: req.body.title,
				options: req.body.options,
				answer: req.body.answer,
				type: req.body.type
			};

			const updatedObj = await CourseTaskAssessmentQuestions.update(assessmentQuestion, {
				where: { id: courseTaskAssessmentQuestionId }
			});
			if (updatedObj == 1) {
				res.send({ message: "Task assessment question has been updated" });
			} else {
				res.status(400).json({ message: "Unable to update task assessment question, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};

exports.delete = async (req, res) => {
	try {
		const joiSchema = Joi.object({
			courseTaskAssessmentQuestionId: Joi.string().required()
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			const courseTaskAssessmentQuestionId = crypto.decrypt(req.body.courseTaskAssessmentQuestionId);
			const assessmentQuestion = {
				isActive: "N"
			};

			const updatedObj = await CourseTaskAssessmentQuestions.update(assessmentQuestion, {
				where: { id: courseTaskAssessmentQuestionId }
			});
			if (updatedObj == 1) {
				res.send({ message: "Task assessment question has been deleted" });
			} else {
				res.status(400).json({ message: "Unable to delete task assessment question, maybe it was not found" });
			}
		}
	} catch (err) {
		emails.errorEmail(req, err);
		res.status(500).json({
			message: err.message || "Some error occurred."
		});
	}
};

exports.check=async(req,res)=>{
	try {
		const joiSchema = Joi.object({
			question: Joi.string().required(),
			answer: Joi.string().required(),
		});
		const { error, value } = joiSchema.validate(req.body);
		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			return res.status(400).json({
				message: message
			});
		} else {
			let answer=req.body.answer.trim()
			let question=req.body.question.trim()

// 			const prompt = `
//       Evaluate the following response to determine if it sufficiently answers the question based on relevance, accuracy, and completeness:
//       Question: ${question}
//       Student Answer: ${answer}
//       Respond with "true" if the answer sufficiently matches the question by at least 70%, otherwise respond with "false".
//     `;
//     console.log(prompt)
// 	// const re = await openai.listModels();
//     // console.log('Available Models:', re.data.data);
// 	const response = await openai.createChatCompletion({
// 		model: "gpt-3.5-turbo",
// 		messages: [{ role: "user", content: "what is OOP?" }], // Chat-based format
// 	  });
// console.log(response)
//     const result = response.data.choices[0].text.trim().toLowerCase();
// console.log(result)

    // const isValid = result === 'true';
    const isValid = 'true';

    res.status(200).json({result: isValid });
		}
	} catch (err) {
		// emails.errorEmail(req, err);
		console.log(err.message)
		res.status(500).json({
			message: err.message || "Some error occurred."
		});		
	}
}
