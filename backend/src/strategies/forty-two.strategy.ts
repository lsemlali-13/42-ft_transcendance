import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-42';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy) {
    constructor(private userService: UserService) {
        super({
            clientID: process.env.INTRA_UID,
            clientSecret: process.env.INTRA_SECRETE,
            callbackURL: 'http://localhost:3000/auth/42_callback',
        });
    }

    validate(accessToken: string, refreshToken: string, profile: Profile, done: Function) {
        const user = {username: profile.username, imageLink: profile._json.image.link}
        const info = this.userService.loginOrRegister(user)
        done(null, info)
    }
}