import express from 'express';
import bootstrap from './src/initiateApp.js';
import dotenv from 'dotenv';
dotenv.config();
const app =express();
const PORT = 4000;
bootstrap(app,express);
app.listen(PORT , "0.0.0.0",()=>{
    console.log(`Server is running on port ${PORT}`);
}); 