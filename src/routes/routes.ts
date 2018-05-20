import { watermark } from "../controllers/watermark"

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
		let documentObject = req.body;
		if (req.file) {
			documentObject.file = req.file;
		}
		const result = await watermark(req.body, log);

		res.attachment("watermark.pdf");
		// res.set('Content-disposition', 'attachment; filename=watermarked.pdf');
		res.set('Content-Type', 'application/pdf');

		res.send(result.response.toBuffer())

		res.end();
	});

}