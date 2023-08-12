const express = require("express");
const passport = require("passport");
const UniversityController = require("../controllers/UniversityController");
const EstablishmentController = require("../controllers/EstablishmentController");
const LaboratoryController = require("../controllers/LaboratoryController");
const NotificationController = require("../controllers/NotificationController");
const UserController = require("../controllers/UserController");
const TeamController = require("../controllers/TeamController");
const authorize = require("../helpers/authorize");
const role = require("../helpers/role");
const statisticsHelper = require("../helpers/statistics");
const PhdStudentController = require("../controllers/PhdStudentController");
const PvController = require("../controllers/PvController")
const BudgetController = require("../controllers/BudgetController")
const router = express.Router();
const GalerieController = require("../controllers/GalerieController")
const MotController = require("../controllers/MotController");
const ProjetController = require("../controllers/ProjetController");


/************* Mots endpoints ***********/

router.post("/mots",
  authorize([role.LABORATORY_HEAD]),
  MotController.createMot
);

router.put(
  "/mots",
  authorize([role.LABORATORY_HEAD]),
  MotController.updateMot
);

router.get(
  "/mots/:_id",
  authorize([role.LABORATORY_HEAD]),
  MotController.findMot
);

router.get(
  "/mots",
  authorize([role.LABORATORY_HEAD]),
  MotController.findAllMots
);

router.get(
  "/motsLab",
  authorize([role.LABORATORY_HEAD]),
  MotController.getMotsByLab
);

router.delete(
  "/mots/:_id",
  authorize([role.LABORATORY_HEAD]),
  MotController.deleteMot
);



/************* Projets endpoints ***********/

router.post(
  "/projets",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.createProjet
);

router.put(
  "/projets",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.updateProjet
);

router.get(
  "/projets/:_id",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.findProjet
);

router.get(
  "/projets",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.findAllProjets
);

router.get(
  "/projetsLab",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.getProjectsByLab
);

router.delete(
  "/projets/:_id",
  authorize([role.LABORATORY_HEAD]),
  ProjetController.deleteProjet
);


/************Galerie endpoints********************/
router.post("/galerie", GalerieController.createGalerie);
router.get("/galerie/:_id", GalerieController.findAll);
router.get("/galerie/doc/:_id/:_doc", GalerieController.findGalerie);
router.delete("/galerie/:_id", GalerieController.deleteGalerie);
router.post("/galerie/removeElement", GalerieController.removeElement)
router.get("/galerie/findOne/:_id", GalerieController.findGalerieById)
router.post("/galerie/pushFile", GalerieController.pushFile)



/************PV endpoints********************/
router.post("/pv", PvController.createPv);
router.get("/pv/:_id", PvController.findAll);
router.get("/pv/doc/:_id/:_doc", PvController.findPv);
router.delete("/pv/:_id", PvController.deletePv);
router.post("/pv/removeElement", PvController.removeElement)
router.get("/pv/findOne/:_id", PvController.findPvById)
router.post("/pv/pushFile", PvController.pushFile)

/************* Users endpoints ***********/
router.get("/users/lab/:_id", UserController.findPhdStudentOfLab);

router.post(
  "/users",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  UserController.createUser
);

router.post(
  "/add-pub", UserController.addPub
);

router.post(
  "/update-pub",UserController.updatePub
);

router.post(
  "/delete-pub", UserController.deletePub
);
router.post(
  "/update-citation", UserController.updateCitation
);

router.post(
  "/add-SJR", UserController.addSJR
);

router.post(
  "/add-IF", UserController.addIF
);

router.put("/users", UserController.updateUser);

router.get("/users/:_id", UserController.findUser);
router.get("/labUsers/:labId", UserController.findAllUsersByLab)


router.get(
  "/users",
  authorize([
    role.CED_HEAD,
    role.VICE_CED_HEAD,
    role.LABORATORY_HEAD,
    role.RESEARCHER,
    role.TEAM_HEAD,
  ]),
  UserController.findAllUsers
);


router.delete(
  "/users/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  UserController.deleteUser
);

router.post("/users/:_id/update-password", UserController.updatePassword);

router.post("/upload-profile-picture", UserController.updateProfilePicture);

router.get("/laboratory-heads", UserController.getLaboratoryHeads);

router.get("/researchers", UserController.getResearchers);

router.get(
  "/publications",
  UserController.findAllPublications,
  authorize([role.LABORATORY_HEAD]),
);

/******************Budget History********************/
router.post("/addBudgetHistory", BudgetController.createBudgetHistory)
router.get("/findHistory/:laboratory_id", BudgetController.findHistory);

/**************** Followed users endpoints  ********/

router.post("/follow", UserController.followUser);

router.get("/unfollow/:authorId", UserController.unfollowUser);

router.get("/is-following/:authorId", UserController.isFollowing);

router.get("/followed-users", UserController.getFollowedUsers);

router.post("/update-followed-user", UserController.updateFollowedUser);

router.get(
  "/filtering-options/:laboratoryHeadId",
  UserController.getFilteringOptions
);

router.get(
  "/director-filtering-options/:user_id",
  authorize([role.RESEARCH_DIRECTOR]),
  UserController.getDirectorFilteringOptions
);

/************* Universities endpoints ***********/

router.post(
  "/universities",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  UniversityController.createUniversity
);

router.put(
  "/universities",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  UniversityController.updateUniversity
);

router.get(
  "/universities/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  UniversityController.findUniversity
);

router.get(
  "/universities",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  UniversityController.findAllUniversities
);

router.delete(
  "/universities/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  UniversityController.deleteUniversity
);

router.get(
  "/universities/:_id/establishments",
  UniversityController.getUniversityEstablishments
);

/************* Establishments endpoints ***********/

router.post(
  "/establishments",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  EstablishmentController.createEstablishment
);

router.put(
  "/establishments",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  EstablishmentController.updateEstablishment
);

router.get(
  "/establishments/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  EstablishmentController.findEstablishment
);

router.get(
  "/establishments",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.RESEARCH_DIRECTOR]),
  EstablishmentController.findAllEstablishments
);

router.delete(
  "/establishments/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  EstablishmentController.deleteEstablishment
);

router.get(
  "/establishments/:_id/laboratories",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD]),
  EstablishmentController.getEstablishmentLaboratories
);

router.get(
  "/establishment-of-director/:user_id",
  authorize([role.RESEARCH_DIRECTOR]),
  EstablishmentController.getEstablishmentOfDirector)
/************* Laboratories endpoints ***********/
router.post(
  "/laboratories",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  LaboratoryController.createLaboratory
);

router.put(
  "/laboratories",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  LaboratoryController.updateLaboratory
);

router.get("/laboratories/:_id", LaboratoryController.findLaboratory);

router.get(
  "/laboratories",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD, role.RESEARCH_DIRECTOR]),
  LaboratoryController.findAllLaboratories
);

router.get(
  "/laboratories-of-director/:user_id",
  LaboratoryController.findLaboratoriesOfDirector
);

router.delete(
  "/laboratories/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  LaboratoryController.deleteLaboratory
);

router.get(
  "/laboratories-of-head/:head_id",
  LaboratoryController.getLaboratoriesOfHead
);

router.get("/free-laboratories", LaboratoryController.getFreeLaboratories);

router.get(
  "/entitle-laboratory/:head_id/:lab_id",
  LaboratoryController.associateHeadToLaboratory
);
router.get("/nodesForOrgChart", LaboratoryController.getNodesForOrgChart);

/***************** Teams endpoints **************/
router.post(
  "/teams",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  TeamController.createTeam
);

router.put(
  "/teams",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  TeamController.updateTeam
);

router.get(
  "/teams",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD, role.TEAM_HEAD]),
  TeamController.findAllTeams
);

router.get("/teams/:_id", TeamController.findTeam);

router.delete(
  "/teams/:_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD, role.TEAM_HEAD]),
  TeamController.deleteTeam
);

router.get(
  "/add-to-team/:team_id/:user_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD, role.TEAM_HEAD]),
  TeamController.addUserToTeam
);

router.get(
  "/remove-from-team/:team_id/:user_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD, role.TEAM_HEAD]),
  TeamController.removeFromTeam
);

router.get(
  "/team-head-association/:team_id/:head_id",
  authorize([role.CED_HEAD, role.VICE_CED_HEAD, role.LABORATORY_HEAD]),
  TeamController.associateHeadToTeam
);

router.get("/statistics", statisticsHelper.getStatistics);
router.get("/team-publications", statisticsHelper.getPublicationsPerTeamPerYear);
router.get("/all-statistics", statisticsHelper.getAllStatistics);

/***************** Notifications endpoints **************/

router.post(
  "/notify-followers",
  authorize([role.LABORATORY_HEAD, role.TEAM_HEAD]),
  NotificationController.notifyFolloweers
);

router.post(
  "/mark-notification-as-read/:notification_id",
  authorize([role.LABORATORY_HEAD, role.TEAM_HEAD]),
  NotificationController.markNotificationAsRead
);

router.get(
  "/notifications/:user_id",
  authorize([role.LABORATORY_HEAD, role.TEAM_HEAD]),
  NotificationController.findUserNotifications
);

router.get(
  "/research-director/:establishment_id",
  EstablishmentController.getResearchDirector
);



router.post(
  "/research-director/:establishment_id/:user_id",
  EstablishmentController.changeResearchDirector
);


/***************** Phd students  endpoints **************/
router.get("/phdStudentsLabs", PhdStudentController.findStudentsOfLab);
router.get("/phdStudentsOfUser", PhdStudentController.findStudentsOfUser);
router.post(
  "/phdStudents",
  PhdStudentController.createPhdStudent
);

router.put(
  "/phdStudents",
  PhdStudentController.updatePhdStudent
);
router.get(
  "/phdStudents/:_id",
  PhdStudentController.findPhdStudent
);


router.get(
  "/phdStudents",
  PhdStudentController.findAllPhdStudents
);

router.delete(
  "/phdStudents/:_id",
  PhdStudentController.deletePhdStudent
);

module.exports = router;
