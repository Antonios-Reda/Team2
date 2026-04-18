const pool = require("../database/db");
const { nanoid } = require("nanoid");

module.exports = {
  create: (data, callBack) => {
    if (data.role === "Doctor") {
      const namespace_id = nanoid(16);

      pool.query(
        `INSERT INTO ${process.env.MYSQL_DB}.user_doctor
                (firstName,lastName,email,password,namespace_id,specialization)
                VALUES (?,?,?,?,?,?)`,
        [
          data.firstname,
          data.lastname,
          data.email,
          data.password,
          namespace_id,
          data.specialization,
        ],
        (error, results) => {
          if (error) {
            return callBack(error);
          }

          return callBack(null, results);
        },
      );
    } else {
      pool.query(
        `INSERT INTO ${process.env.MYSQL_DB}.user_patient
                (firstName,lastName,email,password)
                VALUES (?,?,?,?)`,
        [data.firstname, data.lastname, data.email, data.password],
        (error, results) => {
          if (error) {
            return callBack(error);
          }

          return callBack(null, results);
        },
      );
    }
  },

  getUserByUserEmail: (data, callBack) => {
    const table = data.role === "Doctor" ? "user_doctor" : "user_patient";

    pool.query(
      `SELECT * FROM ${process.env.MYSQL_DB}.${table} WHERE email=?`,
      [data.email],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        if (!results || results.length === 0) {
          return callBack(null, null);
        }

        return callBack(null, results[0]);
      },
    );
  },

  getDoctorsBySpecialization: (specialization, callBack) => {
    pool.query(
      `SELECT id,firstName,lastName,namespace_id
             FROM ${process.env.MYSQL_DB}.user_doctor
             WHERE specialization=?`,
      [specialization],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  addToWaitListService: (data, callBack) => {
    pool.query(
      `INSERT INTO ${process.env.MYSQL_DB}.pending_calls
            (roomid,doctor_id,patient_id)
            VALUES (?,?,?)`,
      [data.room_id, data.doctor_id, data.patient_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  removePatientFromWaitlistService: (data, callBack) => {
    pool.query(
      `DELETE FROM ${process.env.MYSQL_DB}.pending_calls
            WHERE roomid=?`,
      [data.room_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  addPrescriptionService: (data, callBack) => {
    pool.query(
      `INSERT INTO ${process.env.MYSQL_DB}.prescription
            (details,doctor_id,patient_id)
            VALUES (?,?,?)`,
      [data.details, data.doctor_id, data.patient_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  getPrescriptionService: (data, callBack) => {
    pool.query(
      `SELECT details
            FROM ${process.env.MYSQL_DB}.prescription
            WHERE doctor_id=? AND patient_id=?`,
      [data.doctor_id, data.patient_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  getWaitingPatientsService: (data, callBack) => {
    pool.query(
      `SELECT PC.id,PC.roomid,PC.patient_id,UP.firstname,UP.lastname
            FROM ${process.env.MYSQL_DB}.user_patient AS UP,
                 ${process.env.MYSQL_DB}.pending_calls AS PC
            WHERE UP.id = PC.patient_id
            AND doctor_id=?`,
      [data.doctor_id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },

  updateUser: (data, callBack) => {
    const table = data.role === "Doctor" ? "user_doctor" : "user_patient";

    if (data.password) {
      pool.query(
        `UPDATE ${process.env.MYSQL_DB}.${table}
                SET firstName=?,lastName=?,email=?,password=?
                WHERE id=?`,
        [data.firstname, data.lastname, data.email, data.password, data.id],
        (error, results) => {
          if (error) {
            return callBack(error);
          }

          return callBack(null, results);
        },
      );
    } else {
      pool.query(
        `UPDATE ${process.env.MYSQL_DB}.${table}
                SET firstName=?,lastName=?,email=?
                WHERE id=?`,
        [data.firstname, data.lastname, data.email, data.id],
        (error, results) => {
          if (error) {
            return callBack(error);
          }

          return callBack(null, results);
        },
      );
    }
  },

  deleteUser: (data, callBack) => {
    const table = data.role === "Doctor" ? "user_doctor" : "user_patient";

    pool.query(
      `DELETE FROM ${process.env.MYSQL_DB}.${table}
            WHERE id=?`,
      [data.id],
      (error, results) => {
        if (error) {
          return callBack(error);
        }

        return callBack(null, results);
      },
    );
  },
};
