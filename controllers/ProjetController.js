const Projet = require("../models/projet");
const Laboratory = require("../models/laboratory");
const User = require("../models/user");
const { findOne } = require("../models/laboratory");

exports.createProjet = async (req, resp) => {
  try {
    let projet = await Projet.create(req.body);
    resp.status(200).send(projet);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.updateProjet = async (req, resp) => {
  try {
    let result = await Projet.updateOne(
      { _id: req.body._id },
      { $set: req.body }
    );
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findProjet = async (req, resp) => {
  try {
    let projet = await Projet.findById(req.params._id);
    const laboratory = await laboratory.findById(projet.laboratory_id);
    resp.status(200).send({ ...projet, laboratory });
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};

exports.findAllProjets = async (req, resp) => {
  try {
    const projets = await Projet.find();
    const projets_1 = await Promise.all(
        projets.map(async (projet) => ({
        ...projet._doc,
        laboratory: await Laboratory.findOne({
          _id: projet.laboratory_id,
        })
        
      }))
    );
    resp.status(200).send(projets_1);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.getProjectsByLab = async (req, resp) => {
  const laboratoryAbbreviation = req.param("laboratory_abbreviation");
  
  if (!laboratoryAbbreviation) {
    resp.status(200).send(await Project.find());
  }

  if (laboratoryAbbreviation) {
    const laboratory = await Laboratory.findOne({
      abbreviation: req.param("laboratory_abbreviation"),
    });

    const projets = await Projet.find({
      laboratory_id: laboratory._id,
    });
    resp.status(200).send(projets);
  }
};


exports.deleteProjet = async (req, resp) => {
  try {
    const result = await Projet.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send("error");
  }
};





 

  

 

 



