const fs = require("fs");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const FollowedUser = require("../models/followed-user");
const TeamMemberShip = require("../models/team-membership");
const Laboratory = require("../models/laboratory");
const Team = require("../models/team");
const mailSender = require("../helpers/mail-sender");
const differentRoles = require("../helpers/role");
const userHelper = require("../helpers/user-helper");
const PhdStudent = require("../models/phdStudent");
const Establishment = require("../models/establishment");
const TeamMembership = require("../models/team-membership");

exports.createUser = async (req, resp) => {
  const { email, password, roles, creatorId } = req.body;
  const rolesArray = [differentRoles.CED_HEAD, differentRoles.VICE_CED_HEAD, differentRoles.LABORATORY_HEAD, differentRoles.RESEARCHER];
  if (!rolesArray.includes(req.body.roles)) {
    resp.status(400).send({ error: "Incorrect roles value" });
  } else {
    try {
      const user = await User.create({
        email,
        password,
        roles,
        generatedPassword: password,
        creatorId,
      });
      const result = await mailSender.sendEmail(user);
      resp.status(200).send(result);
    } catch (error) {
      console.log(error);
      resp.status(500).send(error);
    }
  }
};

exports.updateUser = async (req, resp) => {
  try {
    const result = await User.updateOne({ _id: req.body._id }, { $set: req.body, hasConfirmed: true, generatedPassword: "" });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.findUser = async (req, resp) => {
  const user = await User.findOne({ _id: req.params._id });

  const laboratoriesHeaded = await Laboratory.find({
    head_id: user._id,
  });

  const teamsHeaded = await Team.find({
    head_id: user._id,
  });

  const teamsMemberships = await TeamMemberShip.find({
    user_id: user._id,
    active: true,
  });

  const phdStudents = await PhdStudent.find({
    supervisor: user._id,
  });

  await Promise.all(teamsMemberships.map((teamsMembership) => Team.findOne({ _id: teamsMembership.team_id })));

  const correspondingFollowedUser = await FollowedUser.findOne({
    user_id: user._id,
  });

  resp.status(200).send({
    ...user._doc,
    laboratoriesHeaded,
    teamsHeaded,
    teamsMemberships,
    correspondingFollowedUser,
    phdStudents,
  });
};

exports.findAllUsers = async (req, resp) => {
  try {
    const users = await User.find().select("-password");
    resp.status(200).send(users);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};


exports.findAllUsersByLab = async (req, resp) => {
  try {
    let labId = req.params.labId;
    let teams = await Team.find({ laboratory_id: labId })
    teams = teams.map((team) => team._id);
    let membersOfLab = await TeamMemberShip.find({ team_id: { $in: teams } });
    membersOfLab = membersOfLab.map((member) => { return member.user_id })

    const members = await User.find({ _id: { $in: membersOfLab } })

    resp.status(200).send(members);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.deleteUser = async (req, resp) => {
  try {
    const result = await User.deleteOne({ _id: req.params._id });
    resp.status(200).send(result);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
};

exports.followUser = async (req, resp) => {
  try {
    const result = await FollowedUser.create(req.body);

    resp.status(200).send({ status: "User followed" });
  } catch (error) {
    console.log(error);

    resp.status(500).send(error);
  }
};
exports.updateFollowedUser = async (req, resp) => {
  try {
    const result = await FollowedUser.findOneAndUpdate({ authorId: req.body.authorId }, { $set: { ...req.body } });
    resp.status(200).send({ status: "User Updated" });
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.unfollowUser = async (req, resp) => {
  try {
    const result = await FollowedUser.findOneAndDelete({
      authorId: req.params.authorId,
    });
    resp.status(200).send({ status: "User unfollowed" });
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.findAllPublications = async (req, resp) => {
  try {
    const response = await FollowedUser.find();
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}

exports.findPhdStudentOfLab = async (req, resp) => {
  try {
    const response = await User.find({ creatorId: req.params._id });
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}


exports.isFollowing = async (req, resp) => {
  const users = await FollowedUser.find({ authorId: req.params.authorId });
  if (users.length == 0)
    resp.status(200).send({
      isFollowing: false,
    });
  else
    resp.status(200).send({
      isFollowing: true,
      oldNumberOfPublications: users[0].publications.length,
    });
};

exports.getFollowedUsers = async (req, resp) => {
  const laboratoryAbbreviation = req.param("laboratory_abbreviation");
  const teamAbbreviation = req.param("team_abbreviation");

  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  if (!laboratoryAbbreviation && !teamAbbreviation) {
    resp.status(200).send(await FollowedUser.find());
  }

  if (laboratoryAbbreviation) {
    const laboratory = await Laboratory.findOne({
      abbreviation: req.param("laboratory_abbreviation"),
    });

    const teams = await Team.find({
      laboratory_id: laboratory._id,
    });

    const teamsMemberShips = await Promise.all(
      teams.map((team) =>
        TeamMemberShip.find({
          team_id: team._id,
          active: true,
          user_id: { $in: followedUsersIds },
        })
      )
    );

    const followedUsers = await Promise.all(teamsMemberShips.flatMap((t) => t).map(({ user_id }) => FollowedUser.findOne({ user_id })));

    const followedUsersAcounts = await Promise.all(teamsMemberShips.flatMap((t) => t).map(({ user_id }) => User.findById(user_id)));

    const result = followedUsersAcounts.map(({ firstName, lastName, roles,profilePicture }, index) => ({
      ...followedUsers[index]._doc,
      firstName,
      lastName,
      roles,
      profilePicture
    }));
    resp.status(200).send(result);
  }

  if (teamAbbreviation) {
    const team = await Team.findOne({
      abbreviation: teamAbbreviation,
    });

    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      active: true,
      user_id: { $in: followedUsersIds },
    });

    const followedUsers = await Promise.all(teamsMemberShips.map(({ user_id }) => FollowedUser.findOne({ user_id })));

    const followedUsersAcounts = await Promise.all(teamsMemberShips.map(({ user_id }) => User.findById(user_id)));

    const result = followedUsersAcounts.map(({ firstName, lastName }, index) => ({
      ...followedUsers[index]._doc,
      firstName,
      lastName,
    }));
    resp.status(200).send(result);
  }
};

exports.updatePassword = async (req, resp) => {
  const hash = await bcrypt.hash(req.body.password, 10);
  return User.updateOne({ _id: req.params._id }, { $set: { password: hash } })
    .then((result) => {
      resp.status(200).send(result);
    })
    .catch((error) => {
      console.log(error);
      resp.status(500).send(error);
    });
};

exports.getLaboratoryHeads = async (req, resp) => {
  try {
    const laboratoryHeads = await User.find({ roles: differentRoles.LABORATORY_HEAD });
    resp.status(200).send(laboratoryHeads);
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.getResearchers = async (req, resp) => {
  try {
    const users = await User.find();
    const researchers = users.filter(user => user.roles.includes(differentRoles.RESEARCHER));
    resp.status(200).send(researchers);
  } catch (error) {
    resp.status(500).send(error);
  }
};

exports.updateProfilePicture = async (req, resp) => {
  let file = req.files.file;
  let user = userHelper.requesterUser(req);
  file.name = user._id;

  User.updateOne({ _id: user._id }, { $set: { profilePicture: file } })
    .then((done) => {
      resp.status(200).send({ message: "file uploaded", profilePicture: file });
    })
    .catch((error) => {
      console.log(error)
      resp.status(500).send(error);
    });
};





exports.addPub = async (req, resp) => {
  const { idAuthor, title, year, citation, source, IF, SJR } = req.body;
  if (citation == "") {
    citation = 0;
  }

  try {
    const Author = await FollowedUser.findOne({ user_id: idAuthor });
    console.log(Author.publications);
    const authors = [];
    authors.push(Author.name);
    var obj = {
      authors,
      title,
      year,
      citation,
      source,
      IF,
      SJR,
    }
    const response = await Author.update({ $push: { publications: obj } })
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}



exports.updatePub = async (req, resp) => {
  const { idAuthor,_id, title, year, citation,authors,source, IF, SJR } = req.body;
      console.log(req.body)

  try {
    

    const response = await FollowedUser.updateOne({user_id:idAuthor, "publications.$._id":_id},{$set:{"publications.$.title":title,"publications.$.year":year,"publications.$.citation":citation,"publications.$.SJR":SJR,"publications.$.authors":authors,"publications.$.searchedFor":true,"publications.$.IF":IF,"publications.$.source":source}});
    resp.status(200).send(response);
    console.log(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}




exports.deletePub = async (req, resp) => {
  const { idAuthor, idPub } = req.body;


  try {
    const Author = await FollowedUser.findOne({ user_id: idAuthor });
    console.log(Author.publications);

    const response = await Author.update({ $pull: { publications: { _id: idPub } } })
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}





exports.updateCitation = async (req, resp) => {
  console.log(req.body.user_id);


  try {
    const Author = await FollowedUser.findOne({ authorId: req.body.authorId });
    console.log(Author);






    const response = await Author.update({ $set: { citationsPerYear: req.body.citationsPerYear, indexes: req.body.indexes, coauthors: req.body.coauthors } })
    resp.status(200).send(response);
  } catch (error) {
    console.log(error);
    resp.status(500).send(error);
  }
}






exports.addSJR = async ( req, resp)=>{
  const {id,IF,SJR,title } = req.body;
  
  try{
    const response = await FollowedUser.updateOne({user_id:id, "publications.title":title},{$set:{"publications.$.SJR":SJR,"publications.$.searchedFor":true,"publications.$.IF":IF}});
    console.log("=====================================")
    console.log(response);
    resp.status(200).send(response);
  }catch(error){
    console.log(error);
    resp.status(500).send(error);
  }
}



exports.addIF = async ( req, resp)=>{
  const {id,IF,title } = req.body;
  
  try{
    const response = await FollowedUser.updateOne({user_id:id, "publications.title":title},{$set:{"publications.$.IF":IF}});
    console.log("=====================================")
    console.log(response);
    resp.status(200).send(response);
  }catch(error){
    console.log(error);
    resp.status(500).send(error);
  }
}






exports.getFilteringOptions = async (req, resp) => {
  const user_id = req.params.laboratoryHeadId;
  let teams = [];
  const laboratory = await Laboratory.findOne({
    head_id: user_id,
  });


  if (!laboratory) {
    teams = await Team.find({
      head_id: user_id,
    });
  } else {
    teams = await Team.find({
      laboratory_id: laboratory._id,
    });
  }




  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  const teamsOptionsPromises = teams.map(async (team) => {
    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      user_id: { $in: followedUsersIds },
      active: true,
    });

    return {
      ...team._doc,
      membershipCount: teamsMemberShips.length,
      optionType: "team",
    };
  });

  /*   const laboratories = await Laboratory.find();

  const laboratoriesOptionsPromises = laboratories.map(async (laboratory) => {
    const teams = await Team.find({
      laboratory_id: laboratory._id,
    });

    const teamsMemberShips = await Promise.all(
      teams.map((team) =>
        TeamMemberShip.find({
          team_id: team._id,
          user_id: { $in: followedUsersIds },
          active: true,
        })
      )
    );

    return {
      ...laboratory._doc,
      membershipCount: teamsMemberShips.flatMap((t) => t).length,
      optionType: "laboratory",
    };
  });

  const laboratoriesOptions = await Promise.all(laboratoriesOptionsPromises);

 */
  const teamsOptions = await Promise.all(teamsOptionsPromises);

  resp.status(200).send([...teamsOptions]);
};


exports.getDirectorFilteringOptions = async (req, resp) => {
  const user_id = req.params.user_id;
  let establishment = await Establishment.findOne({ research_director_id: user_id });
  let laboratories = await Laboratory.find({ establishment_id: establishment._id });

  let teams = [];
  for (let lab of laboratories) {
    let innerTeams = await Team.find({ laboratory_id: lab._id });
    teams = [...teams, ...innerTeams];
  }

  const followedUsers = await FollowedUser.find();
  const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

  const teamsOptionsPromises = teams.map(async (team) => {
    const teamsMemberShips = await TeamMemberShip.find({
      team_id: team._id,
      user_id: { $in: followedUsersIds },
      active: true,
    });

    return {
      ...team._doc,
      membershipCount: teamsMemberShips.length,
      optionType: "team",
    };
  });

  const teamsOptions = await Promise.all(teamsOptionsPromises);

  resp.status(200).send([...teamsOptions]);
};
// exports.getPhdStudents = async (req, resp) => {
//   let user = userHelper.requesterUser(req);
//   try {
//     let userFromDB = await User.findById(user._id, { phdStudents: 1 });
//     let phdStudents = await PhdStudent.find({supervisor:user._id})
//     resp.status(200).json(userFromDB);
//   } catch (err) {
//     console.log(err);
//   }
// };
