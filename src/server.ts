import dotenv from 'dotenv';
dotenv.config();

import express,{Request, Response} from 'express';
import connectDB from './config/db';
import cors from 'cors';
import http from 'http';


const PORT = Number(process.env.PORT) || 3000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

import authRoutes from './routes/authRoutes';
import shipmentRoutes from './routes/shipmentRoutes'
import trackRoutes from './routes/trackRoutes'


//use routes
app.use('/api/auth', authRoutes);
app.use('/shipments', shipmentRoutes)
app.use('/tracking', trackRoutes)


app.get('/health', (req: Request, res: Response) => {
    res.json({ 
        status: 'OK' ,
        timeStamp: new Date().toISOString(),
        mongodb: 'connected'
    });
});

// Root route (consolidated)
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'NovaSend API is running!' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'NovaSend API is running!' })
})

app.get('/ping', (req, res) => {
  res.status(200).send('NovaSend API is running!');
});
// Create HTTP server
const server = http.createServer(app);

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
}

export {app, server} 

startServer();