const router = require("express").Router();
const { checkToken } = require("../middleware/jwt_validation");

const controller = require("./user.controller");

// destructuring
const {
  createUser,
  login,
  updateUsers,
  deleteUser,
  validateUser,
  getDoctors,
  addToWaitList,
  getWaitingPatients,
  removePatientFromWaitlist,
  addPrescription,
  getPrescription,
} = controller;

// ===== ROUTES =====

// validate token
if (validateUser) {
  router.get("/validate", checkToken, validateUser);
}

// auth
router.post("/login", login);
router.post("/signup", createUser);

// doctors
router.post("/getdoctors", getDoctors);

// waiting list
router.post("/addtowaitlist", addToWaitList);
router.post("/getwaitingpatients", getWaitingPatients);
router.post("/removefromwaitlist", removePatientFromWaitlist);

// prescriptions
router.post("/addprescription", addPrescription);
router.post("/getprescription", getPrescription);

// update
router.patch("/", checkToken, updateUsers);

// delete doctor
router.delete("/doctor", checkToken, deleteUser);

module.exports = router;
