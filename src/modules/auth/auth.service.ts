import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UsersService } from '../users/users.service';
import { scrypt } from '../auth/constants/scrypt';
import { err, ok } from "tryless";


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userService.getUserByEmail(email);

    if (!user) {
      return err('NotAuthorizated', 'Invalid email or password');
    }

    const [salt, storedHash] = user.password.split('.');
    const hash = await scrypt(password, salt, 32) as Buffer;

    if(storedHash !== hash.toString('hex')) {
      return err('NotAuthorizated', 'Invalid email or password');
    }

    Logger.log(`User signed in: `, user);

    const payload = { email: user.email, sub: user.id };

    return ok({ accessToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.getOrThrow<string>('JWT_EXPIRATION_TIME'),
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      })
    });
  }
}