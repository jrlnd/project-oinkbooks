import { IsEmail, IsString, Matches, MinLength } from 'class-validator';
import type { RegisterDto as IRegisterDto } from '@oinkbooks/types';

/**
 * v1's register page enforced this username rule client-side:
 *   3–15 chars, letters/digits/._ only, no leading/trailing . or _,
 *   and no consecutive . or _ . Ported verbatim, now enforced server-side.
 */
const USERNAME_REGEX = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;

export class RegisterDto implements IRegisterDto {
  @IsEmail({}, { message: 'A valid email address is required' })
  email!: string;

  @Matches(USERNAME_REGEX, {
    message:
      'Username must be 3–15 characters: letters, digits, . or _, with no leading/trailing or repeated . or _',
  })
  username!: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password!: string;
}
