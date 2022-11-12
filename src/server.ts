import Koa from 'koa';
import Cors from 'koa2-cors';
import { PDFInformation } from './types';
import bodyParser from 'koa-bodyparser';
import * as fs from 'fs';
import create from './creator';



export default async function startServer() {

    const port = process.env.PORT || 3002;
    const app = new Koa();
    let pdfPath: string;
    let pdfInformation: PDFInformation;
    app.use(new Cors());
    app.use(bodyParser());
    app.use(async (ctx:any) =>{
        if(Object.keys(ctx.request.body).length === 0){
            ctx.throw(400, 'invalid request');
            return;
        }
        try{
            pdfInformation = await create(ctx.request.body);
            pdfPath = pdfInformation.path;
            let pdf;
            if (pdfPath) {
                pdf = fs.readFileSync(pdfPath);
            } else {
            throw new Error('pdf creation unsuccessful');
            }
            ctx.body = pdf;
            ctx.res.once('finish', () => {
                fs.unlink(pdfPath, (err) => {
                    if (err) console.log(err);
                    else {
                    console.log(`tmp file: ${pdfPath} deleted!`);
                    }
                });
            
            });

            ctx.response.status = 200;
            ctx.response.set('content-disposition', 'attachment');
            ctx.response.set('content-type', 'application/pdf');
        }catch(err){
            console.log(err);
            ctx.response.status = 400;
        }    

    });

    app.listen(port, () => console.log(`Server listening at port ${port}`));
}

startServer().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });