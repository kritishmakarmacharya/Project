import { Request, Response, NextFunction } from "express";

const allowRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const userRole = req.loggedInUser.role;
            if (!userRole || !roles.includes(userRole)) {
                return res.status(403).json({
                    data: null,
                    message: "You are not authorized to perform this action",
                    meta: null,
                }
                );
            }
            next();
        }catch (exception) {
            next(exception);
        }
    };
};

export default allowRoles;