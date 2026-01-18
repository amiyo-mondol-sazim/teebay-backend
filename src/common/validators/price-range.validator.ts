import type { ValidationArguments, ValidationOptions } from "class-validator";
import { registerDecorator } from "class-validator";

export function IsValidPriceRange(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isValidPriceRange",
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(_value: unknown, args: ValidationArguments) {
          const obj = args.object as Record<string, unknown>;

          const purchaseValid =
            (obj.minPurchasePrice === undefined && obj.maxPurchasePrice === undefined) ||
            obj.minPurchasePrice === undefined ||
            obj.maxPurchasePrice === undefined ||
            (typeof obj.minPurchasePrice === "number" &&
              typeof obj.maxPurchasePrice === "number" &&
              obj.minPurchasePrice <= obj.maxPurchasePrice);

          const rentValid =
            (obj.minRentPrice === undefined && obj.maxRentPrice === undefined) ||
            obj.minRentPrice === undefined ||
            obj.maxRentPrice === undefined ||
            (typeof obj.minRentPrice === "number" &&
              typeof obj.maxRentPrice === "number" &&
              obj.minRentPrice <= obj.maxRentPrice);

          return purchaseValid && rentValid;
        },
        defaultMessage() {
          return "minPurchasePrice must be <= maxPurchasePrice and minRentPrice must be <= maxRentPrice";
        },
      },
    });
  };
}
