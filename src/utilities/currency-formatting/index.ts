import { currencyCountries } from "src/shared/constants/shared.constant";
import { Currency } from "src/shared/interfaces/shared.interface";

export const toCurrency = (
  amount: number,
  currency: Currency,
  hideCurrency = false
) => {
  const currencyCountry = Object.entries(currencyCountries).find(
    ([countryCode, curr]) => {
      if (curr === currency) {
        return countryCode;
      }

      return null;
    }
  );

  return Intl.NumberFormat(
    hideCurrency ? undefined : `en-${currencyCountry?.[0] || "GB"}`,
    {
      currency,
      style: "currency",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }
  ).format(amount);
};
