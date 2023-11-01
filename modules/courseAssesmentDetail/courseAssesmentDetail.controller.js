const { courseTaskAssessmentDetail } = require('../../models');
const Joi = require('@hapi/joi');
const crypto = require('../../utils/crypto');

exports.create = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      question: Joi.string().required(),
      options: Joi.array().items(Joi.string()).required(),
      answer: Joi.string().required(),
      type: Joi.string().required(),
      CourseTaskAssessmentId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const courseTaskAssessmentDetail = await courseTaskAssessmentDetail.create({
      question: req.body.question,
      options: req.body.options,
      answer: req.body.answer,
      type: req.body.type,
      CourseTaskAssessmentId: crypto.decrypt(req.body.CourseTaskAssessmentId),
      isActive: 'Y',
    });

    res.status(201).json(courseTaskAssessmentDetail);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create Course Task Assessment Detail' });
  }
};

exports.update = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      question: Joi.string(),
      options: Joi.array().items(Joi.string()),
      answer: Joi.string(),
      type: Joi.string(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const updated = await courseTaskAssessmentDetail.update(req.body, {
      where: { id: req.body.id },
    });

    if (updated[0]) {
      const updatedCourseTaskAssessmentDetail = await courseTaskAssessmentDetail.findByPk(req.body.id);
      res.status(200).json(updatedCourseTaskAssessmentDetail);
    } else {
      res.status(404).json({ message: 'Course Task Assessment Detail not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Course Task Assessment Detail' });
  }
};

exports.delete = async (req, res) => {
  try {
    const updated = await courseTaskAssessmentDetail.update(
      { isActive: 'N' },
      { where: { id: req.body.id } }
    );

    if (updated[0]) {
      res.status(204).send('Course Task Assessment Detail deleted');
    } else {
      res.status(404).json({ message: 'Course Task Assessment Detail not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete Course Task Assessment Detail' });
  }
};

exports.list = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      CourseTaskAssessmentId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const courseTaskAssessmentDetails = await courseTaskAssessmentDetail.findAll({
      where: { CourseTaskAssessmentId: crypto.decrypt(req.body.CourseTaskAssessmentId), isActive: 'Y' },
    });

    res.status(200).json(courseTaskAssessmentDetails);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Course Task Assessment Details' });
  }
};
