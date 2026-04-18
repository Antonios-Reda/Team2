const {
  create,
  getUserByUserEmail,
  getDoctorsBySpecialization,
  deleteUser,
} = require("./user.service");

module.exports = {
  register: (req, res) => {
    const body = req.body;

    create(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database connection error",
        });
      }

      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },

  login: (req, res) => {
    const body = req.body;

    getUserByUserEmail(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database error",
        });
      }

      if (!results) {
        return res.status(404).json({
          success: 0,
          message: "Invalid Email or Password",
        });
      }

      if (body.password === results.password) {
        results.password = undefined;

        return res.status(200).json({
          success: 1,
          message: "Login successful",
          data: results,
        });
      } else {
        return res.status(401).json({
          success: 0,
          message: "Invalid Email or Password",
        });
      }
    });
  },

  getDoctors: (req, res) => {
    const specialization = req.params.specialization;

    getDoctorsBySpecialization(specialization, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database error",
        });
      }

      return res.status(200).json({
        success: 1,
        data: results,
      });
    });
  },

  deleteUser: (req, res) => {
    const body = req.body;

    deleteUser(body, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({
          success: 0,
          message: "Database error",
        });
      }

      if (!results || results.affectedRows === 0) {
        return res.status(404).json({
          success: 0,
          message: "User not found",
        });
      }

      return res.status(200).json({
        success: 1,
        message: "User deleted successfully",
      });
    });
  },
};
