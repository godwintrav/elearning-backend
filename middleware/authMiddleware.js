const jwt = require('jsonwebtoken');

module.exports.authorize = (credentials = []) => {
    return (req, res, next) => {
        console.log("Authorization Middleware");
        //Check if credentials is a string then convert to array
        if(typeof credentials === "string"){
            credentials = [credentials];
        }

        //find JWT in headers
        const token = req.headers["authorization"];
        if(!token){
            console.log("No token passed!");
            return res.status(401).json({error: "access denied"});
        }else{
            //VALIDATE JWT
            //remove bearer part from authorization token
            const tokenBody = token.slice(7);
            jwt.verify(tokenBody, process.env.SECRET_CODE, (err, decodedToken) => {
                if(err) {
                    console.log(`JWT Error: ${err}`);
                    return res.status(401).json({error: "access denied"});
                }
                //No error JWT is good!

                //Check for credentials being passed in
                if(credentials.length > 0){
                    if(decodedToken.scopes &&
                        decodedToken.scopes.length &&
                        credentials.some(cred => decodedToken.scopes.indexOf(cred) >= 0))
                    {
                        next();
                    }else{
                        console.log("No token passed! out");
                        return res.status(401).json({error: "access denied"});
                    }
                }else{
                    //No Credentials required, user is authorized
                    next();
                }
            });
        }  
    }
}