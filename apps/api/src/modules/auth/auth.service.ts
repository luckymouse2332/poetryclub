import { Injectable } from '@nestjs/common';
import { err, ok, PromiseResult } from '@poetryclub/types';
import { User } from '@prisma/client';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { HASH_ROUNDS } from 'src/common/constants/password.const';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validates a user's credentials.
   *
   * This method checks whether a user with the given username exists
   * and whether the provided password matches the stored hash.
   *
   * @param username - The user's login username.
   * @param password - The plain-text password to verify.
   * @returns A result containing the user data (excluding the password hash)
   *          if validation succeeds, or an error result if the user does not exist
   *          or the password is incorrect.
   */
  async validateUser(
    username: string,
    password: string
  ): PromiseResult<Omit<User, 'passwordHash'>> {
    const queryResult = await this.userService.findOneByName(username);

    if (!queryResult) {
      return err('User with this username does not exist!');
    }

    const { passwordHash, ...results } = queryResult;

    const compareResult = await bcrypt.compare(password, passwordHash);

    if (!compareResult) {
      return err('Invalid password!');
    }

    return ok(results);
  }

  /**
   * Registers a new user
   *
   * @param email - The user's email address used for registration
   * @param password - The user's register password, at least 6 characters long
   * @param username - The user's username replaced by the email when it is null or undefined
   *
   * @returns A result containing the user data (excluding the password hash)
   *          if registration succeeds, or an error result if the user with the given email already exists
   */
  async registerUser(
    email: string,
    password: string,
    username?: string
  ): PromiseResult<Omit<User, 'passwordHash'>> {
    const queryResult = await this.userService.findOneByName(email);

    if (queryResult) {
      return err('The user with given email already exists!');
    }

    const passwordHashed = await bcrypt.hash(password, HASH_ROUNDS);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...results } = await this.userService.add({
      username: username ?? email,
      passwordHash: passwordHashed,
      email,
    });

    return ok(results);
  }

  async signIn(userDto: Omit<User, 'passwordHash'>): Promise<string> {
    return await this.jwtService.signAsync({
      sub: userDto.id,
      username: userDto.username,
    });
  }
}
