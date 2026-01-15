import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { OperationObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

import { ErrorResponseDto } from "@/common/dtos/error-response.dto";

export function setupSwagger(app: INestApplication) {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Teebay API")
    .setDescription("The Backend API for Teebay")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    extraModels: [ErrorResponseDto],
    ignoreGlobalPrefix: true,
    operationIdFactory: (_: string, methodKey: string) => methodKey,
  });

  // Apply global error responses to all paths
  Object.values(document.paths).forEach((path) => {
    Object.values(path).forEach((item) => {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        const method = item as OperationObject;
        method.responses = method.responses || {};
        const errorCodes = [400, 401, 403, 500];

        errorCodes.forEach((code) => {
          // Only add if not already defined for this specific status code
          if (!method.responses[code.toString()]) {
            method.responses[code.toString()] = {
              description:
                code === 400
                  ? "Bad Request"
                  : code === 401
                  ? "Unauthorized"
                  : code === 403
                  ? "Forbidden"
                  : "Internal Server Error",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponseDto" },
                  example: {
                    statusCode: code,
                    message:
                      code === 400
                        ? "Bad Request"
                        : code === 401
                        ? "Unauthorized"
                        : code === 403
                        ? "Forbidden"
                        : "Internal Server Error",
                    errors: [],
                  },
                },
              },
            };
          }
        });
      }
    });
  });

  SwaggerModule.setup("swagger", app, document);
}
