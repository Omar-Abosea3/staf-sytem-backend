import cors from "cors";
import connectDB from "./DB/connection.js";
import { glopalErrorHandelling } from "./utils/errorHandlig.js";
import router from "./router/index.router.js";
import path from 'path';
import { Request , Response , NextFunction} from 'express';
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://192.168.50.4:3000',
    "https://norpetco.vercel.app"
];

const corsMiddleware = (req: Request, res: Response,  next: NextFunction) => {
    const origin = req.header('Origin');
    if (req.method === 'GET') {
        // Allow GET requests from any origin
        cors({ origin: '*' })(req, res, next);
    } else {
        // Restrict other methods to specific origins
        cors({
            origin: (origin, callback) => {
                if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
        })(req, res, next);
    }
};
const bootstrap = (app:any , express:any) => {
    app.use(corsMiddleware);
    app.use(express.json());
    app.use('/uploads', express.static(path.join('uploads')));
    app.use('/api/v1', router);
    app.use((req:any , res:any , next:any) => {
        return res.json({message:"Route not found"});
    });
    app.use(glopalErrorHandelling)
    connectDB();
};

export default bootstrap;