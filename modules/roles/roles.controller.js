const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");

const Roles = db.roles;
const Joi = require('@hapi/joi');

// Find All Roles
exports.findAll = (req, res) => {

    try {
        Roles.findAll({
            where: { isActive: 'Y' },
            attributes: ['id', 'title']
        })
            .then(data => {
                encryptHelper(data);
                res.send(data);
            })
            .catch(err => {
                emails.errorEmail(req, err);
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while retrieving roles."
                });
            });
    } catch (err) {
        emails.errorEmail(req, err);

        res.status(500).send({
            message:
                err.message || "Some error occurred."
        });
    }
};
