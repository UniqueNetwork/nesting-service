export const orderValue = (order: number[]): number => {
  const len = order.length;
  return order.reduce((sum, value, index) => sum + value * (len - index), 0);
};
