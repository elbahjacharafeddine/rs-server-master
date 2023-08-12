const Galerie = require("../models/galerie");
require('../server.js');
var mongoose = require('mongoose');

exports.findAll = async (req, resp) => {
    try {
        const galerie = await Galerie.find({ laboratory_id: mongoose.Types.ObjectId(req.params._id) });
        console.log(galerie)
        resp.status(200).send(galerie);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}


exports.createGalerie = async (req, resp) => {
    var files = req.files;
    var keys = Object.keys(files);
    var photos = new Array();

    keys.forEach((key) => {
        var file = files[key];
        photos.push(file)
    })
    

    try {

        var obj = {
            date: req.body.date,
            photo: photos,
            laboratory_id: req.body.laboratory_id
        }
        const response = await Galerie.create(obj);
       
        resp.status(200).send(true);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }

}

exports.removeElement = async (req, resp) => {
    const { type, racine, element } = req.body;
    var resultGalerieDelete;
    try {
        
        resultGalerieDelete = await Galerie.updateOne({ _id: racine }, { $pull: { "photo": { _id: element } } })
        
        resp.status(200).send(resultGalerieDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}

exports.findGalerieById = async (req, resp) => {
    try {
        const draggedElement = await Galerie.findOne({ _id: req.params._id })
        resp.status(200).send(draggedElement);

    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}

exports.pushFile= async (req, resp) => {
    const {type,racineDestination}=req.body;
    const file = req.files.file;
    var resultPush;
        
    resultPush = await Galerie.updateOne({ _id: racineDestination }, { $push: { "photo": file } })
    
    resp.status(200).send(resultPush );
}

exports.findGalerie = async (req, resp) => {
    try {
        var file = {};
        const galerie = await Galerie.findById(req.params._id);
        galerie.forEach((doc) => {
            if (doc._id == req.params._doc) {
                file = doc;
            }
        })
        resp.status(200).send(file);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
};


exports.deleteGalerie = async (req, resp) => {
    try {
        const resultGalerieDelete = await Galerie.deleteOne({ _id: req.params._id });
        resp.status(200).send(resultGalerieDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}
