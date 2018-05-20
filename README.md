# watermarker

Watermark PDF's

#Credits

Thanks goes to https://github.com/AndreMocke91 for watermark orientation and spacing calculation

# API

The API for the service is currently at `https://api.watermark.gofwd.co.za/`

## POST /watermark

This method accepts 2 lines of text to use for the watermark text and the PDF file to watermark.

# Request body

The request body is:
```ts
{
	line1: "First Watermark Line",
	line1: "Second Watermark Line",
	file: pdfFile,
}
```

The parameters are:

|Name|Required|Description|
|----|--------|-----------|
| line1 | TRUE | The first line of text to write on the PDF |
| line2 | FALSE | The second line of text to write on the PDF |
| file | TRUE | The PDF file to watermark |

## Curl 

This is an example `curl` request.
Replace `yourPDF.pdf` with a PDF file in your current directory. 

```
curl -X POST \
  https://api.watermark.gofwd.co.za/watermark \
  -H 'cache-control: no-cache' \
  -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW' \
  -F file=@yourPDF.pdf \
  -F 'line1=This is a ' \
  -F line2=Watermark
  ```

# Response

## Success

The successful response will return a `200` status code and the new PDF file as a buffer.

## Failures

Undocumented. Failures are not 100% catered for as yet.


# Running your own

The API server requires the following environment variables to be set:

|Name|Default|Description|
|----|--------|-----------|
| WM_API_PORT | 3001 | The port to run the API service on |


# TODO

- full CI
- add tests
- add better failure codes
- refactor code
- improve existing `typescript`
- update documentation to swagger
- add option of more fonts
- add transparency option
- add colour option

