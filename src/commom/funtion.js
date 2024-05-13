export const parsePricetoVn = (price) => {
  const formatter = new Intl.NumberFormat("vi-VN");
  return formatter.format(price);
};
