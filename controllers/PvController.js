const Pv = require("../models/pv");
require('../server.js');
var mongoose = require('mongoose');

exports.findAll = async (req, resp) => {
    try {
        const pv = await Pv.find({ laboratory_id: mongoose.Types.ObjectId(req.params._id) });
        resp.status(200).send(pv);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}


exports.createPv = async (req, resp) => {
    var files = req.files;
    var keys = Object.keys(files);
    var rapports = new Array();
    var annexes = new Array();

    keys.forEach((key) => {
        var file = files[key];
        if ((key=="rapport")&&((file.mimetype == "application/pdf")|| (file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document"))) {
            rapports.push(file);
        } else {
            annexes.push(file)
        }
    })

    try {

        var obj = {
            date: req.body.date,
            rapport: rapports,
            annexe: annexes,
            laboratory_id: req.body.laboratory_id
        }
        const response = await Pv.create(obj);
        resp.status(200).send(response);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }

}

exports.removeElement = async (req, resp) => {
    const { type, racine, element } = req.body;
    var resultPvDelete;
    try {
        if (type == "rapport") {
            resultPvDelete = await Pv.updateOne({ _id: racine }, { $pull: { "rapport": { _id: element } } })
        } else {
            resultPvDelete = await Pv.updateOne({ _id: racine }, { $pull: { "annexe": { _id: element } } })
        }
        resp.status(200).send(resultPvDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}

exports.findPvById = async (req, resp) => {
    try {
        const draggedElement = await Pv.findOne({ _id: req.params._id })
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
    if (type == "annexe") {
        resultPush = await Pv.updateOne({ _id: racineDestination }, { $push: { "annexe": file } })
    } else {
        resultPush = await Pv.updateOne({ _id: racineDestination }, { $push: { "rapport": file } })
    }
    resp.status(200).send(resultPush );
}

exports.findPv = async (req, resp) => {
    try {
        var file = {};
        const pv = await Pv.findById(req.params._id);
        var docs = pv.rapport.concat(pv.annexe)
        docs.forEach((doc) => {
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


exports.deletePv = async (req, resp) => {
    try {
        const resultPvDelete = await Pv.deleteOne({ _id: req.params._id });
        resp.status(200).send(resultPvDelete);
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
}