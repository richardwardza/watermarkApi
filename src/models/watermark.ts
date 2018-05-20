
interface file {
    fieldname: string,
    mimetype: string,
    size: number,
    originalname: string,
    encoding: string,
    destination: string,
    filename: string,
    path: string,
}

export interface IWatermark {
    line1: string;
    line2?: string;
    file: file,
}

