
require('dotenv').config()

import * as express from "express";
import * as compression from "compression";
import * as bodyParser from "body-parser";
import * as cookieParser from "cookie-parser";
import * as multer from "multer";
import * as path from "path";
import { existsSync, mkdirSync } from "fs";

import { configureLogger, configureDB } from "./libs";
import { initRoutes } from "./routes/routes";
import { API_PORT, MAX_FILESIZE, TMP_DIRECTORY } from "./config";

if (!existsSync(TMP_DIRECTORY)) {
  mkdirSync(TMP_DIRECTORY);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, TMP_DIRECTORY)
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 26214400
  },
  fileFilter: function (req, file, cb) {

    var filetypes = /pdf/;
    var mimetype = filetypes.test(file.mimetype);
    var extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    return cb("Error: File upload only supports PDF");
  }
});


const app = express();
const apiPort = API_PORT;

app.use(compression());
app.set("x-powered-by", false);
app.all("*", (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET,POST");
  res.header(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, Authorization"
  );
  if ("OPTIONS" === req.method) return res.send(200);
  next();
});
app.use(bodyParser.json({ limit: MAX_FILESIZE }));
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
  limit: MAX_FILESIZE,
  parameterLimit: 100000,
  extended: true
}));
app.use(cookieParser());

const log = configureLogger();
const db = configureDB(log);

app.listen(apiPort, function () {
  log.info(`API listening on Port ${apiPort}`);
});

async function init() {
  try {
    log.info("Initialising Routes");
    initRoutes({ app, upload, db, log });
  }
  catch (err) {
    log.error(err);
  }
}

if (!module.parent) {
  init();
}