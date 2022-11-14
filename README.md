# Invoice-pdf-Generator
Generates an invoice from json data provided via post request and returns it as pdf file.
## Testing


`npm run test` will send sample request data located at [`./test/request.json`](./test/request.json) by using curl:
```sh
curl -X POST -H 'Content-Type: application/json' -d @./test/request.json http://localhost:3002 --output ./test/result/result.pdf
```
## Preview
<p align="center">
    <img src="./static/img/preview.png">
</p>