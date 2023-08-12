const Mot = require("../models/mot");
const Laboratory = require("../models/laboratory");
const User = require("../models/user");
const { findOne } = require("../models/laboratory");

exports.createMot= async (req, resp) => {
  try {
    let mot = await Mot.create(req.body);
    resp.status(200).send(mot);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.updateMot = async (req, resp) => {
  try {
    let result = await Mot.updateOne(
      { _id: req.body._id },
      { $set: req.body }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findMot = async (req, resp) => {
  try {
    let mot = await Mot.findById(req.params._id);
    const laboratory = await laboratory.findById(mot.laboratory_id);
    resp.status(200).send({ ...mot, laboratory });
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.findAllMots = async (req, resp) => {
  try {
    const mots = await Mot.find();
    const mots_1 = await Promise.all(
        mots.map(async (mot) => ({
        ...mot._doc,
        laboratory: await Laboratory.findOne({
          _id: mot.laboratory_id,
        })
        
      }))
    );
    resp.status(200).send(mots_1);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.getMotsByLab = async (req, resp) => {
  const laboratoryAbbreviation = req.param("laboratory_abbreviation");
  
  if (!laboratoryAbbreviation) {
    resp.status(200).send(await Mot.find());
  }

  if (laboratoryAbbreviation) {
    const laboratory = await Laboratory.findOne({
      abbreviation: req.param("laboratory_abbreviation"),
    });

    const mots = await Mot.find({
      laboratory_id: laboratory._id,
    });
    resp.status(200).send(mots);
  }
};

exports.deleteMot = async (req, resp) => {
  try {
    const result = await Mot.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};





 

  

 

 



