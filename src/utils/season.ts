export const SeasonConfig = {
  startDate: new Date("2025-05-06T08:30:00+08:00"),
  endDate: new Date("2025-08-03T08:30:00+08:00"),
};

export const getSeasonNumber = (date?: Date) => {
  const usedDate = date || new Date();
  if (usedDate < SeasonConfig.startDate || usedDate > SeasonConfig.endDate) {
    return null;
  }

  const diffInTime = usedDate.getTime() - SeasonConfig.startDate.getTime();
  const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));

  const seasonNumber = Math.floor(diffInDays / 7) + 1;

  return seasonNumber;
};

export const SeasonRewards = {
  "1": 1_500_000,
  "2": 2_500_000,
};

export const getCurrentPointsRewards = (totalPoints: number) => {
  console.debug("totalPoints", totalPoints);
  const seasonNumber = getSeasonNumber();
  if (seasonNumber === null) {
    return 0;
  }
  const key = seasonNumber.toString() as keyof typeof SeasonRewards;
  const rewards = SeasonRewards[key];
  if (!totalPoints) {
    return rewards?.toLocaleString();
  }
  return (rewards / totalPoints)?.toLocaleString();
};
