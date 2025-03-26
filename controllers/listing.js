const Listing=require("../models/listing");
module.exports.index = async (req, res) => {
    let alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
}