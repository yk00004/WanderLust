const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapasync = require("../utils/wrapasync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middlewere.js");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs")
})

router.post("/signup", wrapasync(async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let newUser = new User({ email, username });
        let registerduser= await User.register(newUser, password)
        req.login(registerduser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success", `welcome ${username}`)
            res.redirect("/listings")
        })
    } catch (e) {
        req.flash("error", e.message)
        res.redirect("/signup")

    }
}))

router.get("/login", (req, res) => {
    res.render("users/login.ejs")
})
router.post("/login", saveRedirectUrl , passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success","welcome Back.")
    res.redirect(res.locals.redirecturl||"/listings")
})
router.get("/logout",(req,res,next)=>{
    req.logOut((err)=>{
        if(err){
            next(err);
        }else{
            req.flash("success","logged out !");
            res.redirect("/listings")
        }
    })
})
module.exports = router;