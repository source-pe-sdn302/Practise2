const mongoose = require("mongoose");
const subjectSchema = new mongoose.Schema({
  Code: String,
  Name: String,
  Credit: Number,
});
const Subject = mongoose.model("subject", subjectSchema);
module.exports = Subject;
