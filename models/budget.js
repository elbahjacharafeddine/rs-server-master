const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BudgetHistorySchema = new Schema({
    laboratory_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true]
    },
    budget: [
        {
            year: mongoose.Schema.Types.Number,
            budget: mongoose.Schema.Types.Number,
            categories : [Object]
        },
    ]
})

const Budget = mongoose.model("budget", BudgetHistorySchema);
module.exports = Budget;