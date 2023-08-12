const Budget = require("../models/budget");

exports.createBudgetHistory = async (req, resp) => {

    try {
        const responsePull = await Budget.updateOne(
            { laboratory_id: req.body.laboratory_id },
            { $pull: { "budget": { year: req.body.budgetData.year } } }
        );
        const responsePush = await Budget.updateOne(
            { laboratory_id: req.body.laboratory_id },
            {
                $push: {
                    "budget": {
                        year: req.body.budgetData.year,
                        budget: req.body.budgetData.budget,
                        categories: req.body.categories
                    }
                }
            }
        );
        resp.status(200).send(responsePush)
    } catch (error) {
        console.log(error)
        resp.status(500).send(error);
    }
};

exports.findHistory = async (req, resp) => {

    try {
        const response = await Budget.find({ laboratory_id: req.params.laboratory_id})
        resp.status(200).send(response)
    } catch (error) {
        console.log(error)
        resp.status(500).send(error);
    }
};