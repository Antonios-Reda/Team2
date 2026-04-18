const {
  create,
  getUserByUserEmail,
  updateUser,
  deleteUser,
  getDoctorsBySpecialization,
  addToWaitListService,
  getWaitingPatientsService,
  removePatientFromWaitlistService,
  addPrescriptionService,
  getPrescriptionService,
} = require("./user.service");

const { sign } = require("jsonwebtoken");

// ================= VALIDATE TOKEN =================
module.exports.validateUser = (req, res) => {
  return res.json({
    success: 1,
    message: "Valid Token",
  });
};

// ================= SIGNUP =================
module.exports.createUser = (req, res) => {
  const body = req.body;

  create(body, (err, results) => {
    if (err) {
      return res.json({
        success: 0,
        message: "Database error or email exists",
        error: err.sqlMessage,
      });
    }

    return res.json({
      success: 1,
      message: "Signup successful",
      data: results,
    });
  });
};

// ================= LOGIN =================
module.exports.login = (req, res) => {
  const body = req.body;

  getUserByUserEmail(body, (err, results) => {
    if (err) {
      return res.json({ success: 0, message: "Database error" });
    }

    if (!results) {
      return res.json({
        success: 0,
        message: "No such user exist",
      });
    }

    if (body.password === results.password) {
      const token = sign({ result: results }, process.env.JWT_KEY, {
        expiresIn: "5h",
      });

      results.password = undefined;

      return res.json({
        success: 1,
        message: "login successfully",
        currentUser: {
          ...results,
          role: body.role,
          token,
        },
      });
    }

    return res.json({
      success: 0,
      message: "Invalid email or password",
    });
  });
};

// ================= UPDATE =================
module.exports.updateUsers = (req, res) => {
  updateUser(req.body, (err, results) => {
    if (err) {
      return res.json({
        success: 0,
        message: "Update failed",
        error: err.sqlMessage,
      });
    }

    return res.json({
      success: 1,
      message: "updated successfully",
      data: results,
    });
  });
};

// ================= DELETE =================
module.exports.deleteUser = (req, res) => {
  deleteUser(req.body, (err, results) => {
    if (err) {
      return res.json({
        success: 0,
        message: "Database error",
      });
    }

    if (!results || results.affectedRows === 0) {
      return res.json({
        success: 0,
        message: "User not found",
      });
    }

    return res.json({
      success: 1,
      message: "user deleted successfully",
    });
  });
};

// ================= DOCTORS =================
module.exports.getDoctors = (req, res) => {
  getDoctorsBySpecialization(req.body.specialization, (err, results) => {
    if (err) {
      return res.json({ success: 0, message: "DB error" });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};

// ================= WAIT LIST =================
module.exports.addToWaitList = (req, res) => {
  addToWaitListService(req.body, (err, results) => {
    if (err) {
      return res.json({ success: 0, error: err.sqlMessage });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};

module.exports.getWaitingPatients = (req, res) => {
  getWaitingPatientsService(req.body, (err, results) => {
    if (err) {
      return res.json({ success: 0, error: err.sqlMessage });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};

module.exports.removePatientFromWaitlist = (req, res) => {
  removePatientFromWaitlistService(req.body, (err, results) => {
    if (err) {
      return res.json({ success: 0, error: err.sqlMessage });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};

// ================= PRESCRIPTION =================
module.exports.addPrescription = (req, res) => {
  addPrescriptionService(req.body, (err, results) => {
    if (err) {
      return res.json({ success: 0, error: err.sqlMessage });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};

module.exports.getPrescription = (req, res) => {
  getPrescriptionService(req.body, (err, results) => {
    if (err) {
      return res.json({ success: 0, error: err.sqlMessage });
    }

    return res.json({
      success: 1,
      data: results,
    });
  });
};
