const jwt = require("jsonwebtoken");
const JWT_SECRETE = "Sidisacoolguy";

const fetchuser = (req, res, next) => {
    // Get user from jwt token and id
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({error: "You are not authorised"});
    }
    try {
        const data = jwt.verify(token, JWT_SECRETE); 
        req.user = data.id;
        next();
    } catch (error) {
         return res.status(401).send({ error: "You are not authorised" });
    }
    
}
module.exports = fetchuser;
