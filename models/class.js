const mongoose = require("mongoose");
const classSchema = new mongoose.Schema({
  Code: String,
  Name: String,
});
const Class = mongoose.model("class", classSchema);
module.exports = Class;
