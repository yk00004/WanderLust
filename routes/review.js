const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapasync.js");
const { reviewSchema } = require("../schema.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { isLoggedIn, isreviewauthor } = require("../middlewere.js");

const validatereview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body);
    if (error) {
        throw new ExpressError(400, error);
    } else {
        next()
    }
}
// reviews get
router.post("/", isLoggedIn,validatereview, wrapAsync(async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author=req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","new Review created!")
    // res.send("add review succesfully")
    res.redirect(`/listings/${listing._id}`)
}))

// delete review
router.delete("/:reviewId",isLoggedIn,isreviewauthor, wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","review Deleted!")
    res.redirect(`/listings/${id}`);
}))

module.exports=router; //listings/:id/reviews