import adminModel from "../../DB/models/Admin.model.js";
import employeeModel from "../../DB/models/Employee.model.js";
import userModel from "../../DB/models/User.model.js";
import { asyncHandler } from "../utils/errorHandling.js";
import { verifyToken } from "../utils/generateAndVerifyToken.js";

export const auth = (accessRoles = []) => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization) {
      return next(new Error("Authorization is required", { cause: 401 }));
    }
    const decoded = verifyToken({
      payload: authorization,
      signature: process.env.SIGNATURE,
    });
    if (!decoded?.id) {
      return next(new Error("In-valid token payload", { cause: 401 }));
    }
    let authUser;
   
    switch (true) {
      case decoded.role=="user":
        authUser = await userModel.findById(decoded.id);

        break;
      case decoded.role=="admin" || decoded.role =="superAdmin":
        authUser = await adminModel.findById(decoded.id);

        break;
      case decoded.role=="employee":
        authUser = await employeeModel.findById(decoded.id);

        break;
      default:
        return next(new Error("Invalid role", { cause: 401 }));
    }

    if (!authUser) {
      return next(new Error("not register account", { cause: 401 }));
    }
    if (parseInt(authUser.changeAccountInfo?.getTime() / 1000) > decoded.iat) {
      return next(
        new Error("Expired token ,please login again", { cause: 401 })
      );
    }
    if (!accessRoles.includes(authUser.role)) {
      return next(
        new Error("You aren't authorized to take this action!", { cause: 401 })
      );
    }
    req.user = authUser;
    return next();
  });
};
