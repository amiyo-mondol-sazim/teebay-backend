import { ERentalPeriod } from "@/common/enums/products.enums";

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

  // Calculate total rent price based on number of days
  const daysInMs = endDate.getTime() - startDate.getTime();
  const daysRented = Math.ceil(daysInMs / (1000 * 60 * 60 * 24));
  return Math.round(dailyRentPrice * daysRented * 100) / 100;
}
