import passport from "passport";
import LocalStrategy from "passport-local";

passport.use(new LocalStrategy(function verify(username, password, cb) {
    if(username === 'admin' && password === 'admin') {
        return cb(null, 'admin' );
    }
    return cb(null, false);
}))
passport.serializeUser(function(user, done) {
    done(null, 'admin');
});
export default passport
