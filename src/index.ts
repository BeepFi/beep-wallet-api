import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose, { ConnectOptions, MongooseOptions } from "mongoose";
import { ussdRoute, convertService } from "./ussd.route";
// import { example } from "./shared/services/blockchain/smart-contract-client/mono-chain-beep";
import { setInterval } from "timers/promises";
import { whatSappRoute } from "./whatsapp";

dotenv.config();

(async () => {
  try {
    // const we = await convertService.convertBNGNToBToken("+2348104322128", "1", '30')
    // const tok = await convertService.convertBTokenToBNGN("+2348104322128", "1", '30')
    // // console.log('convert service', we)
    // console.log('convert service', tok)
  } catch (err) {
    console.log(
      `Initial Distribution API Database connection error occurred -`,
      err
    );
  }
})();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Sample Route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, Express with TypeScript!");
});

const MONGODB_URI = process.env.MONGODB_URI as string;
(async () => {
    try {
      mongoose.connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as ConnectOptions);
      console.log("Connected To Database - Initial Connection");
    } catch (err) {
      console.log(
        `Initial Distribution API Database connection error occurred -`,
        err
      );
    }
})();

// whatSappRoute()

app.post('/ussd', ussdRoute) 

const sleep = (ms: number | undefined) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});