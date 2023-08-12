const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pvSchema = new Schema({
    file: {
      type: String
    },
    date: { type: Date, default: Date.now },
    annexe:[
    {
        data: Buffer,
        contentType: String,
        name:String,
        mimetype:String

    }],
    rapport:[
    {
        data: Buffer,
        contentType: String,
        name:String,
        mimetype:String
    }],
    laboratory_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Laboratory",
      required: [true],
    },

}, {
  collection: 'pv'
  });

const Pv = mongoose.model("pv", pvSchema);
module.exports = Pv;
