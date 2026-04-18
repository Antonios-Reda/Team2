const app = require("../app");
const request = require("supertest");
const logger = require("../logger");

const baseUrl = "/api/users";

let token = "";
let id = 0;

// email dynamic عشان ميكسرش التست
const email = `test${Date.now()}@gmail.com`;

// Signup Doctor
describe("Signup Doctor", () => {
  it("Create User Success", (done) => {
    request(app)
      .post(`${baseUrl}/signup`)
      .send({
        firstname: "firstname",
        lastname: "lastname",
        email: email,
        password: "password",
        role: "Doctor",
        specialization: "Dermatologist",
      })
      .end((err, res) => {
        if (err) {
          logger.error(err.message);
          return done(err);
        }

        if (res.body.success === 1) {
          logger.info(res.body);
        }

        done();
      });
  });
});

// Login Doctor
describe("Login Doctor", () => {
  it("should be able to login", (done) => {
    request(app)
      .post(`${baseUrl}/login`)
      .send({
        email: email,
        password: "password",
        role: "Doctor",
      })
      .end((err, res) => {
        if (err) {
          logger.error(err.message);
          return done(err);
        }

        if (res.body.success === 1) {
          logger.info(res.body);

          token = res.body.currentUser.token;
          id = res.body.currentUser.id;
        }

        done();
      });
  });
});

// Delete Doctor
describe("Delete Doctor", () => {
  it("Delete User Success", (done) => {
    request(app)
      .delete(`${baseUrl}/doctor`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        id: id,
        role: "Doctor",
      })
      .end((err, res) => {
        if (err) {
          logger.error(err.message);
          return done(err);
        }

        if (res.body.success === 1) {
          logger.info(res.body);
        }

        done();
      });
  });
});

// Signup Patient
describe("Signup Patient", () => {
  it("Create Patient Success", (done) => {
    const patientEmail = `patient${Date.now()}@gmail.com`;

    request(app)
      .post(`${baseUrl}/signup`)
      .send({
        firstname: "firstname",
        lastname: "lastname",
        email: patientEmail,
        password: "password",
        role: "Patient",
      })
      .end((err, res) => {
        if (err) {
          logger.error(err.message);
          return done(err);
        }

        if (res.body.success === 1) {
          logger.info(res.body);
        }

        done();
      });
  });
});
