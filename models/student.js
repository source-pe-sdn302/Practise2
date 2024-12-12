const mongoose = require("mongoose");
const studentsSechma = new mongoose.Schema({
  Code: String,
  FullName: String,
  Dob: String,
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "class",
  },
  subjects: [
    {
      subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subject",
      },
      Grade: Number,
    },
  ],
});

const Student = mongoose.model("student", studentsSechma)
module.exports = Student;
