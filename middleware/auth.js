const jwt = require('jsonwebtoken')

const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization').split(' ')[1] //Bearer TOKEN
        jwt.verify(token, process.env.JWT_ACCESS_SECRET, (err, userId) => {
            if (err) throw new Error('Invalid token!')
            req.user = userId
        })
        next()
    }
    catch (e) {
        res.status(401).send({
            message: 'Please authenticate first'
        })
    }
}

module.exports = authenticateToken
