import { watermark } from "../controllers/watermark"
import { serviceError } from '../libs';

interface IConf {
  app: any,
  upload: any,
  db: any,
  log: any,
};

export function initRoutes({ app, upload, db, log }: IConf) {

  app.post("/watermark", upload.single('file'), async (req, res) => {
    log.info("Received Watermark request");
    log.info("Body - ", req.body);
    log.info("File - ", req.file);

    if (req.file) {
      req.body.file = req.file;
    }
    else {
      log.warn("file not provided");
      return res.status(400).send(serviceError("file is required"))
    }
    const result = await watermark(req.body, log);

    if (result.code !== 200) {
      return res.status(result.code).send(serviceError(result.response.error));
    }

    res.attachment("watermark.pdf");
    res.set('Content-Type', 'application/pdf');

    res.send(result.response.toBuffer())

    res.end();
  });

}