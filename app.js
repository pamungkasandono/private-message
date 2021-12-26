const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");

const connectDB = require("./config/dbconnection");

const app = express();

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 3102;

app.use("/css", express.static(path.resolve(__dirname, "assets/css")));
app.use("/js", express.static(path.resolve(__dirname, "assets/js")));
app.use("/img", express.static(path.resolve(__dirname, "assets/img")));

app.set("trust proxy", true);

connectDB;

const VisitorSchema = new mongoose.Schema({
    ipLocal: String,
    ipGlobal: String,
    count: Number,
    isAccesedTwice: Boolean,
});

const VisitorDB = mongoose.model("visitorDB", VisitorSchema);

let ipglobal = "";
http.get({ host: "api.ipify.org", port: 80, path: "/" }, function (resp) {
    resp.on("data", function (get_ip) {
        ipglobal = get_ip;
        console.log(`My ip global: ${ipglobal}`);
    });
});

app.get("/", async (req, res) => {
    // console.log(req.socket.remoteAddress);
    let iplocal = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

    let visitors = await VisitorDB.findOne({
        $and: [
            {
                ipLocal: iplocal.toString(),
            },
            {
                ipGlobal: ipglobal.toString(),
            },
        ],
    });

    if (visitors == null) {
        const firstCount = new VisitorDB({
            ipLocal: iplocal.toString(),
            ipGlobal: ipglobal.toString(),
            count: 1,
            isAccesedTwice: false,
        });

        // save to database
        firstCount.save();

        // res.send(`<p>First visitor</p>`);
    } else {
        visitors.count += 1;
        visitors.isAccesedTwice = visitors.count >= 2 ? true : false;
        visitors.save();

        // res.send(`<p>Visited: ${visitors.count}x</p>`);
    }

    // if (visitors != null && visitors.count >= 2) {
    //     res.json({
    //         stillCanAccess: false,
    //     });
    // } else {
    //     res.json({
    //         stillCanAccess: true,
    //     });
    // }
    res.sendFile(path.resolve(__dirname, "views/index.html"));
});

app.get("/visitedCount", async (req, res) => {
    let iplocal = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

    let visitors = await VisitorDB.findOne({
        $and: [
            {
                ipLocal: iplocal.toString(),
            },
            {
                ipGlobal: ipglobal.toString(),
            },
        ],
    });

    if (visitors != null && visitors.count > 2) {
        res.json({
            message: "This message is no longer available :)",
        });
    } else {
        res.json({
            message:
                "Because I like you, itu alesan seharusnya aku nggak cerita ini. Dengan cerita ini sebenernya kaya bikin kamu jadi mikir ya kan. Tp jujurly aku gak mau kamu jadi mikir buat ngebiarin aku. :)",
        });
    }
});

app.listen(PORT, () => {
    console.log(`Running on http://localhost:${PORT}`);
});
