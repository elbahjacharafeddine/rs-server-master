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
            ...followedUsers[index]._doc.authorId,
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
            ...followedUsers[index]._doc.authorId,
            firstName,
            lastName,
        }));
        resp.status(200).send(result);
    }
})



app.get('/prof/scopus/:authorId',async (req, res) =>{
    const {authorId} = req.params
    const browser = await getBrowser();
    const page = await browser.newPage();
    try {
        // Définir l'en-tête User-Agent personnalisé
        await page.setUserAgent('Chrome/96.0.4664.93');
        await page.setDefaultNavigationTimeout(85000);
        // await page.waitForFunction(() => document.readyState === 'complete');
        // const navigationPromise = page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        await page.goto('https://www.scopus.com/authid/detail.uri?authorId=' + authorId);
        // await navigationPromise; // Wait for the DOM content to be fully loaded

        console.log('navigation to scopus...')

        await page.waitForSelector('#scopus-author-profile-page-control-microui__general-information-content',{timeout:4000});

        // await page.waitForSelector('.container .AuthorProfilePageControl-module__sgqt5',{ timeout: 3000 })
        // page.waitForTimeout(1000)
        // const name = await page.$eval('#scopus-author-profile-page-control-microui_general-information-content > div.Col-module_hwM1N.offset-lg-2 > div > h1 > strong', (e) => e.textContent.trim().replace(',',''))
        const name =''
        // await page.waitForSelector('#scopus-author-profile-page-control-microui__general-information-content')
        // const univer = await page.$eval('#scopus-author-profile-page-control-microui_general-information-content > div.Col-modulehwM1N.offset-lg-2 > ul > li.AuthorHeader-moduleDRxsE > span > a > span.Typography-modulelVnit.Typography-moduleNfgvc.Button-module_Imdmt', (e) => e.textContent.trim())
        const univer =''
        let h_index=''

        try {
            h_index = await page.$eval("#scopus-author-profile-page-control-microui_general-information-content > div.Col-modulehwM1N.offset-lg-2 > section > div > div:nth-child(3) > div > div > div:nth-child(1) > span.Typography-modulelVnit.Typography-moduleix7bs.Typography-module_Nfgvc",(e) =>e.textContent)
        }catch (error){
            console.log("")
        }
        const interests = []

        await page.waitForTimeout(1000);
        console.log('start scrolling...')
        await autoScroll(page);
        console.log('End of scrolling...')
        await page.waitForTimeout(1500);
        const publications = await page.evaluate(() =>
            Array.from(document.querySelectorAll('.ViewType-module__tdc9K li'), (e) => ({
                title:e.querySelector('h4 span').innerText,
                authors: Array.from((new Set(Array.from(e.querySelectorAll('.author-list span'), (authorElement) => authorElement.innerText)))),
                citation : e.querySelector('.col-3 span:nth-child(1)').innerText,
                year:e.querySelector('.text-meta span:nth-child(2)').innerText.replace('this link is disabled',"").substring(0,4),
                source:e.querySelector('span.text-bold').innerText,
            })));

        const allPath = await page.evaluate(() => Array.from(document.querySelectorAll('path[aria-label]'), (e) => e.getAttribute('aria-label')));


        const citationsPerYear = allPath.map(item => {
            const [yearString, citationsString] = item.split(':');
            const year = parseInt(yearString.trim());
            const citations = parseInt(citationsString.trim());

            return { year, citations };
        });
        const totalCitations = citationsPerYear.reduce((acc, item) => acc + item.citations, 0);
        const indexes = [
            {
                name: "citations",
                total: totalCitations,
                lastFiveYears: "",
            },
            {
                name: "h-index",
                total: h_index,
                lastFiveYears: "",
            },
        ];

        // await page.waitForTimeout(1000);


        const author ={
            name,
            profilePicture: "",
            univer,
            email: "",
            indexes,
            interests,
            publications,
            coauthors: [],
            citationsPerYear,
        };
//
        // res.header('Access-Control-Allow-Origin', 'https://rs-client-master.vercel.app');
        res.send({ "author": { authorId, platform: "scopus", ...author } });
        console.log("the response has been sent")


    } catch (error) {
        console.error('Une erreur s\'est produite :', error);
    }
    finally {
        // let pages = await browser.pages();
        // await Promise.all(pages.map(page =>page.close()));
        await page.close()
        await browser.close()
    }
})


let browser;
const puppeteer = require('puppeteer')
// Function to launch the Puppeteer browser if not already launched.
async function getBrowser() {
    browser = await puppeteer.launch({
        headless: true,
        userDataDir: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    return browser;
}


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            let totalHeight = 0;
            const distance = 100;
            const timer = setInterval(() => {
                const scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}