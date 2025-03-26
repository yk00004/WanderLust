const Listing=require("./models/listing");
const Review=require("./models/review")
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirecturl = req.originalUrl;
        req.flash("error", "You must be logged !");
        return res.redirect("/login");
    }
    next()
}
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirecturl) {
        res.locals.redirecturl = req.session.redirecturl;
    }
    next()
}

module.exports.isowner = async (req, res, next) => {
    let{id}=req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner._id.equals(res.locals.curruser._id)) {
        req.flash("error", "You don't have permesion")
        return res.redirect(`/listings/${id}`);
    }
    next();
}
module.exports.isreviewauthor = async (req, res, next) => {
    let {id,reviewId}=req.params;
    let review = await Review.findById(reviewId);
    if (!review.author._id.equals(res.locals.curruser._id)) {
        req.flash("error", "You don't have permesion")
        return res.redirect(`/listings/${id}`);
    }
    next();
}