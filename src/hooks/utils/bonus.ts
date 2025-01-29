export function getSalesmanBonus(totalPool: number, place: number) {
  switch (place) {
    case 1:
      return totalPool * 0.3;
    case 2:
      return totalPool * 0.2;
    case 3:
      return totalPool * 0.15;
    case 4:
      return totalPool * 0.1;
    case 5:
      return totalPool * 0.08;
    case 6:
      return totalPool * 0.07;
    case 7:
      return totalPool * 0.05;
    case 8:
      return totalPool * 0.05;
    default:
      return 0;
  }
}
