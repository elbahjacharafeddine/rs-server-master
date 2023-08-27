const dotenv = require("dotenv");
dotenv.config();
const fileUpload = require("express-fileupload");
const express = require("express");
const cors = require("cors");
const api = require("./routes/api");
const mongoose = require("mongoose");
const config = require("./config");
const passport = require("passport");
const path = require("path");
const FollowedUser = require("./models/followed-user");
const app = express();
app.use(express.json());
const corsOptions = {
    origin: ['https://rs-client-master.vercel.app', 'http://localhost:3000']
};

app.use(cors(corsOptions));

mongoose.set("useCreateIndex", true);
mongoose
  .connect(config.MONGODB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => console.log("DB Connected!"))
  .catch((error) => console.log(`DB Connection Error: ${error.message}`));

// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGODB_URI,{
//     useUnifiedTopology: true,
//     useNewUrlParser: true,
//   })
//         console.log(`MongoDB Connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error(`Error: ${error.message}`);
//         process.exit(1);
//     }
// };
//
// connectDB()

mongoose.Promise = global.Promise;
require("./auth/auth");

app.listen(config.PORT, () => {
  console.log(`Server started on port ${config.PORT}`);
});

app.use(fileUpload());
app.use("/pictures", express.static(__dirname + "/public/images"));

app.use(
  "/api",
  passport.authenticate("jwt", { session: false }),
  require("./routes/api")
);

app.use("/auth", require("./routes/auth"));

// app.get("/test", (req, resp) => {
//   const token = req.headers.authorization.split(" ")[1];
//   resp.status(200).send(jwt.decode(token));
// });

app.get('/test-backend',(req, res) =>{
    res.send("api is running ...")
})

const { exec } = require('child_process');
app.get('/migrate-database', (req,res) =>{
    exec('node ./seeds/seed.js', (error, stdout, stderr) => {
        if (error) {
            res.send(`Error occurred during the execution of the seeds file.`);
            return;
        }
        res.send(`migration is working`);
    });
})
app.get('/update/:journalName/:year/:sjr', async (req, res) => {
    try {
        const { journalName, year, sjr } = req.params;

        const users = await UserModel.find().limit(5)

        console.log(journalName + "/" + year + "/" + sjr);

        // Send a JSON response with the retrieved users
        res.json(users);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


const amqp = require('amqplib/callback_api')
const {getFollowedUsers} = require("./controllers/UserController");
const Laboratory = require("./models/laboratory");
const Team = require("./models/team");
const TeamMemberShip = require("./models/team-membership");
const User = require("./models/user");
app.get('/listen-to-rabbit',(req, res) =>{
    amqp.connect('amqps://sosytgab:jPleCfcPHfayJEgRoLXeDgVgyt3aBd_0@rattlesnake.rmq.cloudamqp.com/sosytgab',(error0,connection) =>{
        if (error0){
            throw error0
        }
        console.log("connected to RabbitMQ ...")
        connection.createChannel((error1, channel) =>{
            if (error1) {
                throw error1
            }
            console.log('try to read the message')
            channel.assertQueue('elbahja_cle',{durable:false})
            channel.consume('elbahja_cle', (message) =>{
                // const jsonList = message.content.toString(); // Convertir l'objet Buffer en chaîne
                // const listOfObjects = JSON.parse(jsonList);
                console.log(message.content.toString('utf8'));
                // res.send(message.content.toString('utf-8'))
            })
        })
    })
    process.on('beforeExit',() =>{
        console.log("closed the connection RabbitMQ")

    })
})





app.get('/get-followed-users',async (req, resp) => {
    const laboratoryAbbreviation = "LTI"
    const teamAbbreviation = undefined;
    console.log("laboratoryAbbreviation is :"+ laboratoryAbbreviation)
    console.log("teamAbbreviation is :"+ teamAbbreviation)

    const followedUsers = await FollowedUser.find();
    // console.log('followed user are :' +followedUsers)
    const followedUsersIds = followedUsers.map(({ user_id }) => user_id);

    if (!laboratoryAbbreviation && !teamAbbreviation) {
        resp.status(200).send(await FollowedUser.find());
    }

    if (laboratoryAbbreviation) {
        const laboratory = await Laboratory.findOne({
            abbreviation: laboratoryAbbreviation,
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
})