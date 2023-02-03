const express = require("express");

const authenticateToken = require("../middleware/auth");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

const createAccessToken = (userId) => {
    return jwt.sign({
        userId
    }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: '10m'
    })
}

const createRefreshToken = (userId, tokenId) => {
    return jwt.sign({
        userId, tokenId
    }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d'
    })
}

const validateRefreshToken = async (token) => {
    const decodeToken = () => {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET, (err, refreshToken) => {
            if (err) {
                throw new Error("Token expired!")
            }
            return refreshToken
        });
    }

    const decodedToken = decodeToken();
    const tokenExists = await RefreshToken.exists({ _id: decodedToken.tokenId, owner: decodedToken.userId });
    if (tokenExists) {
        return decodedToken;
    } else {
        throw new Error("Token does not exist!")
    }
}

const register = async (req, res) => {
    try {
        let encryptedPassword
        await bcrypt.hash(req.body.password, 10).then((hash) => {
            encryptedPassword = hash
        })
        const user = User({
            username: req.body.username,
            password: encryptedPassword,
            name: req.body.name,
            email: req.body.email
        })
        await user.save()

        return res.json({
            "message": "Registeration successful!"
        })

    } catch (e) {
        return res.status(400).send({ "message": e.message });
    }
}

const login = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            throw new Error("Invalid username or password");
        }

        await bcrypt.compare(req.body.password, user.password).then((result) => {
            if (!result) {
                throw new Error("Invalid username or password");
            }
        })

        const refreshTokenDoc = RefreshToken({
            owner: user.id
        })

        const accessToken = createAccessToken(user.id)
        const refreshToken = createRefreshToken(user.id, refreshTokenDoc.id)

        await refreshTokenDoc.save()
        return res.status(200).send({ accessToken, refreshToken });
    } catch (e) {
        return res.status(400).send({ "message": e.message });
    }
};

const refresh = async (req, res) => {
    try {
        const refreshToken = await validateRefreshToken(req.body.refreshToken);
        const accessToken = createAccessToken(refreshToken.userId);

        return res.json({
            accessToken,
            refreshToken: req.body.refreshToken
        });
    } catch (e) {
        return res.status(400).send({ "message": e.message })
    }
}

const logout = async (req, res) => {
    try {
        const refreshToken = await validateRefreshToken(req.body.refreshToken);
        await RefreshToken.deleteOne({ _id: refreshToken.tokenId });
        return res.json({ "message": "Logged out successfully" })
    } catch (e) {
        return res.status(400).send({ "message": e.message });
    }
};

const profile = async (req, res) => {
    try {
        const projection = { password: 0 };
        const user = await User.findOne({ _id: req.user.userId }, projection)
        if (!user) {
            throw new Error("Can't find user")
        }
        return res.json(user)
    }
    catch (e) {
        return res.status(400).send({ "message": e.message })
    }
}


const router = new express.Router();
router.post("/register", register)
router.post("/login", login);
router.post("/refresh", refresh)
router.post("/logout", authenticateToken, logout);
router.get("/profile", authenticateToken, profile)

module.exports = router;
