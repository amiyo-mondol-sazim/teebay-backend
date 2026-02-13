import type { INestApplication } from "@nestjs/common";
import { HttpStatus } from "@nestjs/common";

import type { EntityManager, IDatabaseDriver, Connection, MikroORM } from "@mikro-orm/core";

import { faker } from "@faker-js/faker";
import request from "supertest";

import { ERentalPeriod } from "@/common/enums/products.enums";
import { EUserRole } from "@/common/enums/roles.enums";

import { seedPermissionsData } from "../auth/auth.helpers";
import { bootstrapTestServer } from "../utils/bootstrap";
import { truncateTables } from "../utils/db";
import { getAccessToken } from "../utils/helpers/access-token.helpers";
import { createUserInDb } from "../utils/helpers/create-user-in-db.helpers";
import type { THttpServer } from "../utils/types";

describe("Product Images E2E", () => {
  let app: INestApplication;
  let dbService: EntityManager<IDatabaseDriver<Connection>>;
  let httpServer: THttpServer;
  let orm: MikroORM<IDatabaseDriver<Connection>>;

  beforeAll(async () => {
    const { appInstance, dbServiceInstance, httpServerInstance, ormInstance } =
      await bootstrapTestServer();
    app = appInstance;
    dbService = dbServiceInstance;
    httpServer = httpServerInstance;
    orm = ormInstance;
    await seedPermissionsData(dbService);
  });

  afterAll(async () => {
    await truncateTables(dbService);
    await orm.close();
    await httpServer.close();
    await app.close();
  });

  afterEach(() => {
    dbService.clear();
  });

  describe("POST /products with imageUrl", () => {
    const testUserEmail = faker.internet.email();
    const testUserPassword = faker.internet.password();

    let accessToken: string;

    beforeAll(async () => {
      await createUserInDb(dbService, {
        email: testUserEmail,
        password: testUserPassword,
        role: EUserRole.ADMIN,
      });

      accessToken = await getAccessToken(httpServer, testUserEmail, testUserPassword);
    });

    it("should create a product with imageUrl", async () => {
      // Step 1: Get presigned URL
      const presignResponse = await request(httpServer)
        .post("/file-uploads")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          files: [
            {
              name: `products/${faker.string.uuid()}.jpg`,
              type: "image/jpeg",
              maxSize: 5242880, // 5MB
            },
          ],
        })
        .expect(HttpStatus.CREATED);

      const { signedUrl, name } = presignResponse.body.data[0];

      expect(signedUrl).toBeDefined();
      expect(name).toBeDefined();
      expect(name).toMatch(/^products\/.+\.jpg$/);

      // Step 2: In a real scenario, we would upload to S3 using the signedUrl
      // For this test, we'll skip the actual S3 upload and construct the imageUrl
      const bucketUrl = process.env.AWS_S3_BUCKET_URL || "http://localhost:4566/bucket";
      const imageUrl = `${bucketUrl}/${name}`;

      // Step 3: Create product with imageUrl
      const productResponse = await request(httpServer)
        .post("/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Test Product with Image",
          description: "A test product with an image",
          categories: ["test"],
          purchasePrice: 100,
          rentPrice: 10,
          rentalPeriod: ERentalPeriod.DAY,
          imageUrl,
        })
        .expect(HttpStatus.CREATED);

      expect(productResponse.body.data).toMatchObject({
        id: expect.any(Number),
        title: "Test Product with Image",
        description: "A test product with an image",
        categories: ["test"],
        purchasePrice: 100,
        rentPrice: 10,
        rentalPeriod: ERentalPeriod.DAY,
        imageUrl,
      });
    });

    it("should create a product without imageUrl", async () => {
      const productResponse = await request(httpServer)
        .post("/products")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          title: "Test Product without Image",
          description: "A test product without an image",
          categories: ["test"],
          purchasePrice: 50,
          rentPrice: 5,
          rentalPeriod: ERentalPeriod.DAY,
        })
        .expect(HttpStatus.CREATED);

      expect(productResponse.body.data).toMatchObject({
        id: expect.any(Number),
        title: "Test Product without Image",
        description: "A test product without an image",
        categories: ["test"],
        purchasePrice: 50,
        rentPrice: 5,
        rentalPeriod: ERentalPeriod.DAY,
      });
      // imageUrl should not be present when not provided
      expect(productResponse.body.data).not.toHaveProperty("imageUrl");
    });
  });
});
