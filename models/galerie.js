const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const galerieSchema = new Schema({
  file: {
    type: String
  },
  date: { type: Date, default: Date.now },
  photo: [
    {
      data: Buffer,
      contentType: String,
      name: String,
      mimetype: String

    }],
  laboratory_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Laboratory",
    required: [true],
  },

}, {
  collection: 'galerie'
});

const Galerie = mongoose.model("galerie", galerieSchema);
module.exports = Galerie;
