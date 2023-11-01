const { courseTaskAssessment } = require('../../models');
const { courseTaskAssessmentDetail } = require('../../models');

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

      question: Joi.string().optional(),
      options: Joi.array().items(Joi.string()).optional(),
      answer: Joi.string().optional(),
      type: Joi.string().optional(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    courseTaskAssessment.create({
        title: req.body.title,
        description: req.body.description,
        estimatedTime: req.body.estimatedTime,
        startTime: req.body.startTime,
        courseId: crypto.decrypt(req.body.courseId),
        isActive: "Y",
      }).then((response)=>{
        if(req.body.question){
          courseTaskAssessmentDetail.create({
                question: req.body.question,
                options: req.body.options,
                answer: req.body.answer,
                type: req.body.type,
                CourseTaskAssessmentId: response.id,
                isActive: 'Y',
              }).then((response)=>{
                res.status(201).json(courseTaskAssessment,courseTaskAssessmentDetail)

              }).catch((err)=>{
                res.status(500).json({
                  message: err.message || 'Some error occurred.',
                });
              })
        }
        res.status(201).json(courseTaskAssessment)
      })
.catch((err)=>{
  res.status(500).json({
    message: err.message || 'Some error occurred.',
  });
})
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
      courseTaskAssesmentId:Joi.string().required(),
      question: Joi.string().optional(),
      options: Joi.array().items(Joi.string()).optional(),
      answer: Joi.string().optional(),
      type: Joi.string().optional(),
      courseTaskAssesmentDetailId: Joi.string().optional(),
    });

    const { error, value } = joiSchema.validate(req.body);

    if (error) {
      const message = error.details[0].message.replace(/"/g, '');
      return res.status(400).json({
        message: message,
      });
    }

    const updated = await courseTaskAssessment.update(req.body, {
      where: { id: courseTaskAssesmentId },
    });
    if(req.body.question){
     let courseAssesmentDetail=await courseTaskAssessmentDetail.update({
        question: req.body.question,
        options: req.body.options,
        answer: req.body.answer,
        type: req.body.type,
        CourseTaskAssessmentId: courseAssesmentId.id,
        isActive: 'Y',
      },{where: { id: courseTaskAssesmentDetailId }})
    }

    if (updated[0] === 1) {
      const updatedCourseTaskAssessment = await courseTaskAssessment.findByPk(req.params.id);
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
    const deleted = await courseTaskAssessment.update(
      { isActive: "N" },
      { where: { id: req.body.id } }
    );

    if (deleted[0] === 1) {
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

exports.detail = async (req, res) => {
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

    const courseTaskAssessments = await courseTaskAssessment.findAll({
      where: { courseId: crypto.decrypt(req.body.courseId) },
      include: [{
        model: courseTaskAssessmentDetail,
      }]
    });

    res.status(200).json(courseTaskAssessments);
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to fetch Course Task Assessments',
    });
  }
};
