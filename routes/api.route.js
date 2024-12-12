const express = require("express");
const db = require("../models");

const ApiRouter = express.Router();

function calAge(dob) {
  const dobYear = dob.split("-")[0];
  return 2024 - parseInt(dobYear);
}

ApiRouter.get("/student/list", async (req, res, next) => {
  try {
    const students = await db.Student.find()
      .populate("class")
      .populate("subjects");
    res.status(200).json(
      students.map((s) => {
        return {
          _id: s._id,
          Code: s.Code,
          FullName: s.FullName,
          Age: calAge(s.Dob),
          ClassName: s.class.Name,
          Subjects: s.subjects.map((sub) => {
            return {
              _id: sub.subject._id,
              Grade: sub.Grade,
            };
          }),
        };
      })
    );
  } catch (error) {
    res.status(500).json({
      error: {
        status: 500,
        message: error.message,
      },
    });
  }
});
function calCpa(subjects) {
  let cpa = 0;
  let totalA = 0;
  let totalCredit = 0;
  for (const s of subjects) {
    totalA += s.subject.Credit * s.Grade;
    totalCredit += s.subject.Credit;
  }
  cpa = (totalA / totalCredit).toFixed(2);
  return cpa;
}
ApiRouter.get("/student/:studentCode", async (req, res, next) => {
  try {
    const studentCode = req.params.studentCode;
    const student = await db.Student.findOne({
      Code: studentCode,
    })
      .populate("class")
      .populate("subjects.subject");
    res.status(200).json({
      _id: student._id,
      Code: student.Code,
      FullName: student.FullName,
      Age: calAge(student.Dob),
      ClassName: student.class.Name,
      Subjects: student.subjects.map((s) => {
        return {
          SubjectName: s.subject.Name,
          Grade: s.Grade,
        };
      }),
      CPA: calCpa(student.subjects),
    });
  } catch (error) {
    res.status(500).json({
      error: {
        status: 500,
        message: error.message,
      },
    });
  }
});

ApiRouter.put("/student/:studentId", async (req, res, next) => {
  try {
    const studentId = req.params.studentId;
    const student = await db.Student.findById(studentId);
    const subjects = req.body.subjects;
    if (!student) {
      return res.status(500).json({
        error: {
          status: 500,
          message: `StudentId: ${studentId} does not exist`,
        },
      });
    }
    for (const s of subjects) {
      const subjectExist = await db.Subject.findById(s.subject_id);
      if (!subjectExist) {
        return res.status(500).json({
          error: {
            status: 500,
            message: `SubjectId: ${s.subject_id} does not exist`,
          },
        });
      }

      const index = student.subjects.findIndex(
        (sub) => sub.subject.toString() === s.subject_id.toString()
      );
      if (index !== -1) {
        student.subjects[index].Grade = s.Grade;
        await student.save();
      } else {
        await db.Student.findByIdAndUpdate(studentId, {
          $push: {
            subjects: {
              subject: s.subject_id,
              Grade: s.Grade,
            },
          },
        });
      }
    }
    const updatedStudent = await db.Student.findById(studentId);
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({
      error: {
        status: 500,
        message: error.message,
      },
    });
  }
});

module.exports = ApiRouter;
