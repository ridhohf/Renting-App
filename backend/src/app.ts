import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { ENV } from './config/env.config';
import { MainRouter } from './routes/main.router';
import { errorMiddleware } from './middlewares/error.middleware';

export class App {
  private app: Application;
  private mainRouter: MainRouter;

  constructor() {
    this.app = express();
    this.mainRouter = new MainRouter();
    this.configureMiddlewares();
    this.configureRoutes();
    this.configureErrorHandler();
  }

  private configureMiddlewares(): void {
    this.app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private configureRoutes(): void {
    this.app.use(this.mainRouter.getRouter());
  }

  private configureErrorHandler(): void {
    this.app.use(errorMiddleware);
  }

  public getApp(): Application {
    return this.app;
  }
}
