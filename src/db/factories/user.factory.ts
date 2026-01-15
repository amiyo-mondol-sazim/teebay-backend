import { Factory } from "@mikro-orm/seeder";

import { faker } from "@faker-js/faker";

import { UserProfile } from "@/common/entities/user-profiles.entity";
import { User } from "@/common/entities/users.entity";
import { EUserState } from "@/common/enums/users.enums";

export class UserFactory extends Factory<User> {
  model = User;

  definition(): Partial<User> {
    const userProfile = new UserProfile(faker.person.firstName(), faker.person.lastName());

    // Using a pre-calculated hash for "password123"
    const passwordHash =
      "$argon2id$v=19$m=65536,t=3,p=4$nTSpLD7F2eHaEl5CvTm/nw$OlVEHeEiEi73uKj0x61yYhLkVXNg9KVEG+GA0/XPE1s";

    return {
      email: faker.internet.email(),
      password: passwordHash,
      state: EUserState.ACTIVE,
      verifiedAt: new Date(),
      firstLoginAt: new Date(),
      userProfile: userProfile,
    };
  }
}
