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
const https = require('https')
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


app.get('/test-backend',(req, res) =>{
    res.send("api is running ...")
})

const { exec } = require('child_process');
const {Publication} = require("./models/publication");
app.get('/migrate-database', (req,res) =>{
    exec('node ./seeds/seed.js', (error, stdout, stderr) => {
        if (error) {
            res.send(`Error occurred during the execution of the seeds file.`);
            return;
        }
        res.send(`migration is working`);
    });
})

app.get('/get-sjr-app', async (req, res) => {
    try {
        const title = 'Design a secure framework for cloud-based medical image storage';
        const year = '2017';
        const publication = await FollowedUser.findOne({
            'title': title,
            'year': year,
        });

        if (publication) {
            res.json(publication.publications);
        } else {
            res.status(404).send('Publication not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal server error');
    }
});
