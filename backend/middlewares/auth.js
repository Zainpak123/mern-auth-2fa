const {getUser} = require('../service/auth')

function restrictToLoggedInUserOnly(req,res,next){
    //const token = req.cookies?.uid;

    const userId = req.headers['authorization'];

    if(!userId) return res.status(401).json({ message: 'Unauthorized: No Token'})
        
        const token = userId.split("Bearer ")[1];
        console.log(token)
        const user = getUser(token);

        if(!user) return res.status(401).json({message: 'Unauthorized: Invalid Token'})

            req.user = user;
            next();
}
function restrictToRoles(...allowedRoles) {
  return function (req, res, next) {
    const user = req.user; 

    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden: You do not have access' });
    }

    next();
  };
}




module.exports = {restrictToLoggedInUserOnly, restrictToRoles};