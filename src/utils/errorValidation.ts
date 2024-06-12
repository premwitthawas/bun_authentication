import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export const errorValidation = (error: any, set: any) => {
  if (error instanceof PrismaClientKnownRequestError) {
    set.status = 400;
    return {
      status: 400,
      name: error.name,
      code: error.code,
      modelEror: error.meta!.modelName,
    };
  } else if (error instanceof JsonWebTokenError) {
    set.status = 401;
    return {
      status: 401,
      name: error.name,
      message: error.message,
    };
  } else {
    set.status = 500;
    return {
      status: 500,
      message: "Internal Server Error",
    };
  }
};
