import { db } from "../config/dbConfig.js";
import { execQuery } from "../utils/dbUtil.js";

// Helper function to execute a query with parameters
const execQueryWithParams = (query, params, callback) => {
  db.query(query, params, (err, results) => {
    if (callback && typeof callback === "function") {
      callback(err, results);
    } else {
      return err || results;
    }
  });
};

export const loginMdl = function (signupdata, callback) {
  const QRY_TO_EXEC = `SELECT * FROM user WHERE email = ?`;
  execQueryWithParams(QRY_TO_EXEC, [signupdata.userEmail], (err, results) => {
    callback(err, results);
  });
};

export const createUserMdl = function (userData, callback) {
  const {
    userName,
    firstName,
    lastName,
    email,
    password,
    address,
    mobileNo,
    role,
    bio,
    specialty,
    experienceYears,
  } = userData;

  // Check if the email already exists
  const checkEmailQuery = `SELECT COUNT(*) AS emailCount FROM user WHERE email = ?`;

  execQueryWithParams(checkEmailQuery, [email], (err, results) => {
    if (err) {
      // Handle the error
      if (callback && typeof callback === "function") {
        callback(err, null);
      } else {
        return err;
      }
    } else {
      const emailCount = results[0].emailCount;

      // Check if the username already exists
      const checkUsernameQuery = `SELECT COUNT(*) AS usernameCount FROM user WHERE user_name = ?`;

      execQueryWithParams(checkUsernameQuery, [userName], (err, results) => {
        if (err) {
          // Handle the error
          if (callback && typeof callback === "function") {
            callback(err, null);
          } else {
            return err;
          }
        } else {
          const usernameCount = results[0].usernameCount;

          if (emailCount > 0) {
            // Email already exists, return an error
            const emailExistsError = new Error("Email already exists");
            if (callback && typeof callback === "function") {
              callback(emailExistsError, null);
            } else {
              return emailExistsError;
            }
          } else if (usernameCount > 0) {
            // Username already exists, return an error
            const usernameExistsError = new Error("Username already exists");
            if (callback && typeof callback === "function") {
              callback(usernameExistsError, null);
            } else {
              return usernameExistsError;
            }
          } else {
            // Insert the new user
            let insertUserQuery;
            const queryParams = [
              userName,
              firstName,
              lastName,
              email,
              password,
              mobileNo,
              address,
              role,
            ];

            if (role === 'chef') {
              // Include chef-specific fields
              insertUserQuery = `
                INSERT INTO user (user_name, first_name, last_name, email, password, mobile_no, address, role, bio, specialty, experience_years)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;
              queryParams.push(bio, specialty, experienceYears);
            } else {
              // Insert without chef-specific fields
              insertUserQuery = `
                INSERT INTO user (user_name, first_name, last_name, email, password, mobile_no, address, role)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `;
            }

            execQueryWithParams(insertUserQuery, queryParams, (err, results) => {
              if (callback && typeof callback === "function") {
                callback(err, results);
              } else {
                return err || results;
              }
            });
          }
        }
      });
    }
  });
};

export const getAllChefsMdl = function (callback) {
  const QRY_TO_EXEC = `SELECT * FROM user WHERE role = 'chef'`;
  execQueryWithParams(QRY_TO_EXEC, [], (err, results) => {
    callback(err, results);
  });
};