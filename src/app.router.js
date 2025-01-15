import connectDB from "../DB/connection.js";
import { glopalErrHandling } from "./utils/errorHandling.js";
import adminRouter from "./modules/admin/admin.router.js";
import empolyeeRouter from "./modules/empoloyee/empoloyee.router.js";
import userRouter from "./modules/user/user.router.js";
import authRouter from './modules/auth/auth.router.js'
import operationRouter from './modules/operations/operation.router.js'
const initApp = (app, express) => {
  app.use(express.json({}));

  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/operations", operationRouter);
  app.use("/employee", empolyeeRouter);
  app.use("/user", userRouter);

  app.all("*", (req, res, next) => {
    return next(new Error("error 404 in-valid routing",{cause:404}))
  });

  app.use(glopalErrHandling);

  //connect DataBase
  connectDB();
};

export default initApp;
