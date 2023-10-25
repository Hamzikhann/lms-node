const db = require("../../models");
const encryptHelper = require("../../utils/encryptHelper");
const emails = require("../../utils/emails");
const crypto = require("../../utils/crypto");

const Joi = require("@hapi/joi");

const Client=db.clients
const Users=db.users

const create=async(req,res)=>{
    try {
        const joiSchema = Joi.object({
			name: Joi.string().required(),
            website: Joi.string().required(),
            logoURL: Joi.string().required(),
		});
		// console.log(req.body);
		const { error, value } = joiSchema.validate(req.body);

		if (error) {
			emails.errorEmail(req, error);

			const message = error.details[0].message.replace(/"/g, "");
			res.status(400).send({
				message: message
			}); 
		} else{

            const client=await Client.findOne({where:{website:req.body.websit.trim(),isActive:"Y"}})

            if(client){
                res.status(401).send({
					mesage: "Client already registered."
				});
            }else{

                const clientObj={
                    name:req.body.name,
                    website:req.body.website,
                    logoURL:req.body.logo
                }
                let transaction = await sequelize.transaction();

                Client.create(clientObj,{transaction}
                    .then(async(client)=>{
                        await transaction.commit();
	
                        res.status(200).send({
                    
                            message: "Client is created successfully."
                        });


                    }))
                    .catch(async (err) => {
						if (transaction) await transaction.rollback();
						emails.errorEmail(req, err);
						res.status(500).send({
							message: err.message || "Some error occurred while creating the Quiz."
						});
					});
            }

        }
    } catch (err) {
        emails.errorEmail(req, err);

		res.status(500).send({
			message: err.message || "Some error occurred."
		});
    }
}

const getAllClients=async(req,res)=>{
    try {
        Client.findAll({where:{isActive:"Y"},
        include:[
            {
                models:Users,
                where: { isActive: "Y" },
                attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }

            }
        ],
        required: false,
        attributes: { exclude: ["createdAt", "updatedAt", "isActive"] }

    })
    } catch (err) {
        
    }
}

module.exports={create,getAllClients}