const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

const uri = process.env.MONGO_URI;

// console.log(uri);

const connectDb = mongoose
    .connect(uri, { useNewUrlParser: true })
    .then((result) => {
        console.log(`Database connect: ${result.connection.host}`);
    })
    .catch((err) => {
        console.log(`Database connection error: ${err}`);
    });

module.exports = connectDb;
