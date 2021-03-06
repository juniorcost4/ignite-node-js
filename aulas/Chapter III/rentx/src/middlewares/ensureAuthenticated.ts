import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { AppError } from "../erros/AppError";
import { UsersRepository } from "../modules/accounts/repositories/implementatios/UsersRepository";

interface IPayload {
    sub: string;
}

export async function ensureAuthenticated(
    request: Request,
    response: Response,
    next: NextFunction
) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        throw new AppError("Token missing", 401);
    }

    const [_, token] = authHeader.split(" ");

    try {
        const { sub: id } = verify(token, "900dfdc74b2109ab409129ba8578bc52") as IPayload;

        const usersRepository = new UsersRepository();

        const user = await usersRepository.findById(id);

        if (!user) {
            throw new AppError("User does not exists", 401);
        }

        request.user = {
            id
        }

        next();
    } catch {
        throw new AppError("Invalid token", 401);
    }
}