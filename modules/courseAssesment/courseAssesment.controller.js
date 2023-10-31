const { CourseTaskAssessment } = require('../../models');
const crypto = require('../../utils/crypto');
const Joi = require('@hapi/joi');

exports.create = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      estimatedTime: Joi.number().required(),
      startTime: Joi.date().required(),
      courseId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const courseTaskAssessment = await CourseTaskAssessment.create({
      title: req.body.title,
      description: req.body.description,
      estimatedTime: req.body.estimatedTime,
      startTime: req.body.startTime,
      courseId: crypto.decrypt(req.body.courseId),
    });

    res.status(201).json(courseTaskAssessment);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Some error occurred.',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      title: Joi.string().required(),
      description: Joi.string().required(),
      estimatedTime: Joi.number().required(),
      startTime: Joi.date().required(),
      courseId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const updated = await CourseTaskAssessment.update(req.body, {
      where: { id: req.params.id },
    });

    if (updated[0] === 1) {
      const updatedCourseTaskAssessment = await CourseTaskAssessment.findByPk(req.params.id);
      return res.status(200).json(updatedCourseTaskAssessment);
    } else {
      throw new Error('Course Task Assessment not found');
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to update Course Task Assessment',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await CourseTaskAssessment.destroy({
      where: { id: req.params.id },
    });

    if (deleted) {
      res.status(204).send('Course Task Assessment deleted');
    } else {
      throw new Error('Course Task Assessment not found');
    }
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to delete Course Task Assessment',
    });
  }
};

exports.list = async (req, res) => {
  try {
    const joiSchema = Joi.object({
      courseId: Joi.string().required(),
    });

    const { error, value } = joiSchema.validate(req.params);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const courseTaskAssessments = await CourseTaskAssessment.findAll({
      where: { courseId: crypto.decrypt(req.params.courseId) },
    });

    res.status(200).json(courseTaskAssessments);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to fetch Course Task Assessments',
    });
  }
};
