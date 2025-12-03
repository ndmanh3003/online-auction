import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import * as userService from '../services/user.service.js';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.OAUTH_CALLBACK_URL || 'http://localhost:3000'}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, done) {
      try {
        let user = await userService.findByGoogleId(profile.id);

        if (!user) {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
          if (email) {
            user = await userService.findByEmail(email);
            if (user) {
              user.googleId = profile.id;
              await user.save();
            }
          }

          if (!user) {
            user = await userService.createFromOAuth(profile, 'google');
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await userService.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;

