const { required } = require("joi")
const mongoose = require("mongoose")
const passportlocalmongoose = require("passport-local-mongoose")

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true
    }
});

userSchema.plugin(passportlocalmongoose);

module.exports = mongoose.model("User", userSchema);