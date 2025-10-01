const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const UserRepo = require('../repos/UserRepo.js');
const RoleRepo = require('../repos/RoleRepo.js');
const { ROLES } = require('../constants/constants.js');

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // console.log('Google Profile:', profile);
        
        // Check if user already exists with this Google ID
        let user = await UserRepo.findUser({
            where: { googleId: profile.id }
        });

        if (user) {
            // User exists, return user
            return done(null, user);
        }

        // Check if user exists with same email
        user = await UserRepo.findUser({
            where: { email: profile.emails[0].value }
        });

        if (user) {
            // User exists with same email, link Google account
            user.googleId = profile.id;
            user.emailVerified = true; // Google emails are verified
            await user.save();
            return done(null, user);
        }

        // Create new user
        const studentRole = await RoleRepo.findRole({
            where: { name: ROLES.STUDENT }
        });

        const newUser = await UserRepo.createUser({
            googleId: profile.id,
            email: profile.emails[0].value,
            username: profile.displayName || profile.emails[0].value.split('@')[0],
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            imageUrl: profile.photos[0]?.value || null,
            roleId: studentRole.id,
            emailVerified: true, // Google emails are verified
            password: null // No password for OAuth users (allowed after migration)
        });

        return done(null, newUser);
    } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, null);
    }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await UserRepo.findUser({
            where: { id },
            attributes: { exclude: ['password', 'resetCode', 'resetCodeExpiresAt'] }
        });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

module.exports = passport;
