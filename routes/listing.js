const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isowner } = require("../middlewere.js")

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })

const listingscontrollers = require("../controllers/listing.js");

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const maptoken=process.env.MAP_TOKEN;
const geocodingclient = mbxGeocoding({ accessToken: maptoken });

const validatelisting = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next()
    }
}

router.get("/", wrapAsync(listingscontrollers.index));

router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
})
router.get("/:id", wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate({ path: "reviews", populate: { path: "author" } }).populate("owner");
    if (!listing) {
        req.flash("error", "That listing does not exist")
        res.redirect("/listings")
    }

    res.render("listings/show.ejs", { listing });
}))

router.post("/", isLoggedIn, upload.single("listing[image]"), validatelisting, wrapAsync(async (req, res, next) => {
    
    let response=await geocodingclient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();
    let url = req.file.path;
    let filename = req.file.filename;

    const newlisting = new Listing(req.body.listing);

    newlisting.owner = req.user._id;
    newlisting.image = { url, filename }
    newlisting.geometry=response.body.features[0].geometry;
    
    await newlisting.save()
    req.flash("success", "New Listing Created!")
    res.redirect("/listings")
}))

router.get("/:id/edit", isLoggedIn, isowner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "That listing does not exist")
        res.redirect("/listings")
    }
    let origini=listing.image.url;
    origini=origini.replace("/upload","/upload/w_250")
    res.render("listings/edit.ejs", { listing,origini })

}))


router.put("/:id", isLoggedIn, isowner, upload.single("listing[image]"), validatelisting, wrapAsync(async (req, res) => {
    let { id } = req.params;
    
    let response=await geocodingclient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    }).send();

    let listing = await Listing.findByIdAndUpdate(id, req.body.listing);
    
    listing.geometry=response.body.features[0].geometry;
    
    
    if (typeof req.file !=="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        
    }
    await listing.save();
    req.flash("success", "Listing updeted!")
    res.redirect(`/listings/${id}`);

}))
router.delete("/:id", isLoggedIn, isowner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}));

module.exports = router;