var hummus = require('hummus');
var streams = require('memory-streams');
var fs = require("fs");

const DEFAULT_FONT_SIZE = 45;
const FONT = "Arial.ttf";
const OPACITY = 0.3;

export function watermarkDocument(pdf, line1: string, line2: string, log) {

    //Initial font size - may be decreased in getTextMatric if the text is too long to fit the diagonal.
    const fontSize: number = DEFAULT_FONT_SIZE;
    const matrixCache: object = {};
    const objectCache: object = {};


    const document = fs.readFileSync(pdf);
    const inBuffer = new hummus.PDFRStreamForBuffer(document);
    const readBuffer = new hummus.PDFRStreamForBuffer(document);

    const ws = new streams.WritableStream();
    const outBuffer = new hummus.PDFStreamForResponse(ws);

    const pdfWriter = hummus.createWriterToModify(inBuffer, outBuffer);

    var font = pdfWriter.getFontForFile('./Arial.ttf');
    const pdfReader = hummus.createReader(readBuffer);

    if (pdfReader.isEncrypted()) {
        log.warn(`${pdf} - PDF is encrypted - cannot watermark`);
        return null;
    }
    for (let i = 0; i < pdfReader.getPagesCount(); ++i) {
        //Get page size [left, bottom, right, top]
        const pageDimensions = pdfReader.parsePage(i).getCropBox();

        //:[number, number, number, number];
        //calculate the text size and angle
        const tmMatrix = getRotationMatrix(matrixCache, line1, line2, font, 45, pageDimensions[2], pageDimensions[3]);
        matrixCache[`${pageDimensions[2]} ${pageDimensions[3]}`] = tmMatrix;

        //Save the page size object to the cache
        const xObject = createXObject(tmMatrix, objectCache, line1, line2, font, pageDimensions, pdfWriter);
        objectCache[`${pageDimensions[2]} ${pageDimensions[3]}`] = xObject;

        //get the page from the pdf in a modifier context
        const pageModifier = new hummus.PDFPageModifier(pdfWriter, i, true);

        //Write the "page object" onto the existing pdf page.
        const modifier = pageModifier.startContext().getContext();
        modifier.q()
            .doXObject(xObject)
            .Q();
        pageModifier.endContext().writePage();
    }
    pdfWriter.end();

    return ws;
}

//Calculate the angle the text should be displayed at from bottom left.
//This takes into consideration the orientation of the page - landscape vs portrait will have different angles from bottom left to top right.
function getRotationMatrix(matrixCache, textOne: string, textTwo: string, font: any, fontSize: number, pageRight: number, pageTop: number) {
    const cachedMatrix = matrixCache[`${pageRight} ${pageTop}`];
    if (cachedMatrix) {
        return cachedMatrix;
    }

    const diagonal = Math.hypot(pageTop, pageRight);
    let angle = 0;
    let longerText = (textOne.length > textTwo.length) ? textOne : textTwo;
    let textDimensions = font.calculateTextDimensions(longerText, fontSize);
    let lesserFontSize = fontSize;

    while (textDimensions.width > diagonal * 0.8) {
        fontSize--;
        lesserFontSize = fontSize;
        textDimensions = font.calculateTextDimensions(longerText, fontSize);
    }

    const textOnDiagonalDimensions = font.calculateTextDimensions(textOne, fontSize);
    const textWidth = textOnDiagonalDimensions.width;
    const textHeight = textOnDiagonalDimensions.height;
    const diagonalOffset = (diagonal - textWidth) / 2;



    angle = -(Math.atan(pageTop / pageRight)); // to rotate anti-clockwise the angle is negated


    const rightOffset = (diagonalOffset * Math.sin(-angle)); // a positive angle is required to calculate the triangle
    const bottomOffset = (diagonalOffset * Math.cos(-angle)); // a positive angle is required to calculate the triangle

    const subOffset = CalculateSubOffset(textOne, textTwo, angle, font, fontSize);

    const tMatrix = {
        a: Math.cos(angle),
        b: -Math.sin(angle),
        c: Math.sin(angle),
        d: Math.cos(angle),
        e: bottomOffset,
        f: rightOffset,
        lesserFontSize,
        subXOffset: subOffset.x,
        subYOffset: subOffset.y
    }
    return tMatrix;
}

/* Create the transparent graphic state with 0.5 transparency */
function createTransparencyObject(pdfWriter): number {
    const objCxt = pdfWriter.getObjectsContext();
    const gsId = objCxt.startNewIndirectObject();
    const dict = objCxt.startDictionary()
    dict.writeKey("type");
    dict.writeNameValue("ExtGState");
    dict.writeKey("ca");
    objCxt.writeNumber(OPACITY);
    objCxt.endLine();
    objCxt.endDictionary(dict);
    return gsId;
}


// #242: Use xObjectForm to get the gsName (graphic state name)
function assignGsStateToResource(xObject, gsId) {
    const resourcesDict = xObject.getResourcesDictinary(); // This is not a typo =~=
    return resourcesDict.addExtGStateMapping(gsId);
}


//Make an object once that can be reused on many pages
function setXObject(xObject, gsName, font, tmMatrix, line1, line2) {

    xObject.getContentContext()
        .q()
        .gs(gsName) //Use the graphic state we created earlier
        .BT() // Begin Text
        .k(0, 0, 0, 0.3) // Set Color (CMYK, 0-1)
        .Tf(font, tmMatrix.lesserFontSize) // Set font and font size
        .Tm(tmMatrix.a, tmMatrix.b, tmMatrix.c, tmMatrix.d, (tmMatrix.e - 10), (tmMatrix.f - 10)) // Set the text matrix to the angle calculated in getTextMatrix
        .Tj(line1); // Write the text

    if (line2 !== "") {
        xObject.getContentContext()
            .Tm(tmMatrix.a, tmMatrix.b, tmMatrix.c, tmMatrix.d, tmMatrix.e + tmMatrix.subXOffset, tmMatrix.f - tmMatrix.subYOffset)
            .Tj(line2) // More text
    }

    xObject.getContentContext()
        .ET() // End Text
        .Q();
}

//Get the correct text matrix to display the text diagnoally across the page from corner to corner
//This caters for portrait, landscape and anything in between
function createXObject(tmMatrix, objectCache, watermarkLine1, watermarkLine2, font, pageDimensions, pdfWriter) {

    //Check if we have created an object for this page size already
    const cachedObject = objectCache[`${pageDimensions[2]} ${pageDimensions[3]}`];
    if (cachedObject) {
        return cachedObject;
    }

    //Create the transparency object
    const gsId = createTransparencyObject(pdfWriter);

    //Create a "page object" that we can later assign the transparency object to
    const xObject = pdfWriter.createFormXObject(0, 0, pageDimensions[2], pageDimensions[3]);

    //Add the graphic state to the "page object" and get the name back
    const gsName = assignGsStateToResource(xObject, gsId);

    //Write the text to the "page object"
    setXObject(xObject, gsName, font, tmMatrix, watermarkLine1, watermarkLine2);
    pdfWriter.endFormXObject(xObject);

    return xObject;
}
function CalculateSubOffset(textOne: string, textTwo: string, angle: number, font, fontSize: number) {
    const mainBox = font.calculateTextDimensions(textOne, fontSize);
    const subBox = font.calculateTextDimensions(textTwo, fontSize);
    const fontS = subBox.height * 2;

    let x: number = 0, y: number = 0;

    if (textOne.length >= textTwo.length) {
        const delta: any = (mainBox.width - subBox.width) / 2;
        const hypot: any = Math.hypot(delta, fontS);
        const theta: any = -Math.asin(fontS / hypot);
        const beta: any = angle - theta;

        x = hypot * Math.cos(beta);
        y = hypot * Math.sin(beta);
    } else {

        const delta: any = (subBox.width - mainBox.width) / 2;
        const hypot: any = Math.hypot(delta, fontS);
        const theta: any = Math.asin(fontS / hypot);
        const beta: any = angle - theta;

        x = - hypot * Math.cos(beta);
        y = - hypot * Math.sin(beta);

    }
    return { x, y };
}
