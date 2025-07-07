const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authHeader = req.headers.token;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
      if (err) res.status(403).json("Invalid token!");
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json("Not authenticated!");
  }
}

function verifyTokenandAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json("You are not permitted to do that");
    }
  });
}

function verifyTokenandAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.userId || req.user.isAdmin) { //if current user or admin logged in
      next();
    } else {
      res.status(403).json("You are not permitted to do that");
    }
  });
}

module.exports = { verifyToken, verifyTokenandAdmin, verifyTokenandAuthorization };
