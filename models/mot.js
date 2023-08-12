const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MotSchema = new Schema({
  description: {
    type: String,
    required: [true],
  },
  laboratory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true],
  },
});

const Mot = mongoose.model("mot", MotSchema);
module.exports = Mot;
