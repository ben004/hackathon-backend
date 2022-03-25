"use strict";

require("dotenv").config();

const _ = require("lodash");
const moment = require("moment-timezone");
// const { isEmpty, isNull } = require("lodash");
// const {
//   instantiateDB,
//   executeDynamicInsert,
//   executeSelectQuery,
//   disconnectDb,
//   executeDynamicUpdate,
//   findOrCreateTable,
// } = require("./lib/db");
const timeZone = "Asia/Bangkok";

exports.sampleAPI = (event, context) => {
  try {
    context.callbackWaitsForEmptyEventLoop = false;
    console.log("Hiiii")
    return {
      success: true,
    }
  } catch (error) {
    console.log(error);
    return {
      success: false
    }
  }
}