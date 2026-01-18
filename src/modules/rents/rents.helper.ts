import { ERentalPeriod } from "@/common/enums/products.enums";

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DECIMAL_PRECISION_MULTIPLIER = 100;
export function calculateRentPrice(
  rentPrice: number,
  rentalPeriod: ERentalPeriod,
  startDate: Date,
  endDate: Date,
): number {
  let dailyRentPrice: number;
  switch (rentalPeriod) {
    case ERentalPeriod.WEEK:
      dailyRentPrice = rentPrice / 7;
      break;
    case ERentalPeriod.MONTH:
      dailyRentPrice = rentPrice / 30;
      break;
    case ERentalPeriod.DAY:
    default:
      dailyRentPrice = rentPrice;
      break;
  }

  const daysInMs = endDate.getTime() - startDate.getTime();
  const daysRented = Math.ceil(daysInMs / MS_PER_DAY);
  return (
    Math.round(dailyRentPrice * daysRented * DECIMAL_PRECISION_MULTIPLIER) /
    DECIMAL_PRECISION_MULTIPLIER
  );
}
