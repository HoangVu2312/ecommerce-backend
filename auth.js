// This is authorization middleware file to verify token

import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        // step 1: get token from request-header
        let token = req.header("Authorization");

        // step 2: check if token exists then slice token from Bearer
        if (!token) return res.status(403).send("Access denied!");

        if (token.startsWith("Bearer ")) {
            token = token.slice(7, token.length).trimLeft();
        }

        // step 3: verify token by jwt (always needed JWT_SECRET to verify)
        const verified = jwt.verify(token, process.env.JWT_SECRET);
 
        // step 4: accept token and let user do the next action
        req.user = verified;
        next();

    } catch (err) {
        res.status(500).json({ error: err.message});
    }
}