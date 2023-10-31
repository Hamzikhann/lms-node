const { CourseTaskAssessmentDetail } = require('../../models');
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
      res.status(400).json({
        message: message,
      });
    } else {
      const courseTaskAssessmentDetail = await CourseTaskAssessmentDetail.create(req.body);
      res.status(201).json(courseTaskAssessmentDetail);
    }
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
      res.status(400).json({
        message: message,
      });
    } else {
      const updated = await CourseTaskAssessmentDetail.update(req.body, {
        where: { id: req.params.id },
      });

      if (updated[0]) {
        const updatedCourseTaskAssessmentDetail = await CourseTaskAssessmentDetail.findByPk(req.params.id);
        res.status(200).json(updatedCourseTaskAssessmentDetail);
      } else {
        res.status(404).json({ message: 'Course Task Assessment Detail not found' });
      }
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Course Task Assessment Detail' });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await CourseTaskAssessmentDetail.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
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

    const { error, value } = joiSchema.validate(req.params);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      res.status(400).json({
        message: message,
      });
    } else {
      const courseTaskAssessmentDetails = await CourseTaskAssessmentDetail.findAll({
        where: { CourseTaskAssessmentId: crypto.decrypt(req.params.CourseTaskAssessmentId) },
      });
      res.status(200).json(courseTaskAssessmentDetails);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Course Task Assessment Details' });
  }
};
