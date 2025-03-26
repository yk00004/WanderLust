if(process.env.NODE_ENV !="production")
require("dotenv").config();


const express = require("express");
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodoverride = require("method-override");

const session = require("express-session");
const Mongostore=require("connect-mongo")
const flash=require("connect-flash");

const Listing = require("./models/listing.js"); //set hear database path+model 
const Review = require("./models/review.js");
const User=require("./models/user.js");

const wrapAsync = require("./utils/wrapasync.js");
const ExpressError = require("./utils/ExpressError.js");//for custom error throw
const { listingSchema, reviewSchema } = require("./schema.js");

const ejsMate = require("ejs-mate");
//for set {layout} in ejs files

const passport=require("passport");
const LocalStrategy=require("passport-local");

const listingsrouter = require("./routes/listing.js");
const reviewsrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");
const MongoStore = require("connect-mongo");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public"))); //set hear for css path 
app.set("views", path.join(__dirname, "views")); //set hear ejs fill path
 //set hear ejs fill path
app.use(methodoverride("_method"));

app.engine('ejs', ejsMate);
let dburl=process.env.ATLAST_URL;
    

const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET,
    },
    touchAfter:24*60*60,
})

app.use(session({
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly:true,
    }
}))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//
//
//
main().then(() => { console.log("connected") });
async function main() {
    mongoose.connect(dburl);
}
app.use((req,res,next)=>{
    res.locals.success=req.flash("success")
    res.locals.error=req.flash("error")
    res.locals.curruser=req.user;
    next();
})

app.use("/listings", listingsrouter);
app.use("/listings/:id/reviews", reviewsrouter)
app.use("/",userrouter);



app.all("*", (req, res, next) => {
    next(new ExpressError(404, "page not found"))
})
app.use((err, req, res, next) => {
    let { status = 500, message = "wrong" } = err;
    res.status(status).render("listings/error.ejs", { message })
})

const HOST = "192.168.195.1"
app.listen(3000, () => {
    console.log("done..192.168.195.1");

})