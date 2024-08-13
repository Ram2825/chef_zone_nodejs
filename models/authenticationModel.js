import { db } from "../config/dbConfig.js";
import { execQuery } from "../utils/dbUtil.js";

export const loginMdl = function (signupdata, callback) {
  var QRY_TO_EXEC = `SELECT * FROM user where email= "${signupdata.userEmail}"`
  if (callback && typeof callback == "function")
    execQuery(
      db,
      QRY_TO_EXEC,
      function (err, results) {
        callback(err, results);
        console.log()
        return;
      }
    );
  else return execQuery(db, QRY_TO_EXEC);

};