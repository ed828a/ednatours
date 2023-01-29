// const dotenv = require('dotenv');  // for debugging
// dotenv.config({ path: './config.env' }); // for debugging

const app = require("./app");
const mongoose = require("mongoose");

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGO_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useFindAndModify: false,  // not supported in new version
    // useCreateIndex: true      // not supported in new version
}).then(con => {
    // console.log(con.connections)
    console.log('DB connection is successful!')
})





// console.log(app.get("env")); // app.get('env') returns 'development' if NODE_ENV is not defined.
// Be sure to set NODE_ENV to "production" in a production environment;
// process.env.NODE_ENV isn't set automatically. You must set it by yourself
// console.log(process.env.NODE_ENV);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
