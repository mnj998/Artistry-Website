const mongoose = require( 'mongoose' ) ;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const respond = require( "./response");
const jwtPass = "abc";

var userSchema = new mongoose.Schema ({
    email    : { type : String, index: { unique: true } },
    pass : String,
    name : String,
    ts       : Date, // RefreshToken creation time
});

userSchema.statics.signUp = async ( req, res  ) => {
    try {
        const userData  = req.body ;
        const user = new User() ;
        userData.pass = await bcrypt.hash( userData.pass, 10 ) ;
        Object.assign( user, userData ) ;
        await user.save() ;
        return respond.ok( res ) ;
    } catch ( err ) {
        if ( err.code === 11000 )
            throw { err : errData.duplicateErr, info : 'email Already Exist' };
        throw err;
    }
    return null;
}

userSchema.statics.signIn = async ( req, res ) => {
    const {email, pass } = req.body;
    const user = await User.findOne( { email } , { pass:1, type:1 } ) ;
    if ( user ) {
        const passMatched = await bcrypt.compare( pass, user.pass ) ;
        if ( passMatched ) {
            const payload = { _id: user._id };
            const token = jwt.sign( payload, jwtPass );
            return respond.ok( res, {token} );
        }

    }
    throw { err : respond.errData.invalidCredential, info : 'email or pass is Incorrect!' } ;
}

const User = mongoose.model( 'users', userSchema ) ;
module.exports = User;