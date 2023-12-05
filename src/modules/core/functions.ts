import { hexColors } from './constant';

export const countBlockedWebsites = (value: any) => {
  let count: number = 0;
  const mapGroup: any = [];
  let mapGroupData: any = [];
  value.forEach((item: any) => {
    mapGroupData = mapGroup.map((item: any) => item.activity);
    if (
      !mapGroupData.includes(item.activityDisplayName) &&
      item.activityType === 'WEB_SURF' &&
      item.questionable === true
    ) {
      count += 1;
    }
  });

  return count;
};

export const filterUsedApps = (value: any) => {
  const mapGroup: any = [];
  let mapGroupData: any = [];
  value.forEach((item: any) => {
    mapGroupData = mapGroup.map((item: any) => item.activity);
    if (
      !mapGroupData.includes(item.activityDisplayName) &&
      item.activityType === 'APP'
    ) {
      mapGroup.push({
        activity: item.activityDisplayName,
        type: item.activityType,
      });
    }
  });
  let groupData = mapGroup.map((item: any) => {
    const filter = value.filter(
      (value: any) => value.activityDisplayName === item.activity
    );
    const total = filter.reduce(
      (prev: any, { duration }: any) => prev + duration,
      0
    );
    return {
      total,
      type: item.type,
      activity: item.activity,
    };
  });

  return groupData;
};

export const filterVisitedWebsites = (value: any) => {
  const mapGroup: any = [];
  let mapGroupData: any = [];
  value.forEach((item: any) => {
    mapGroupData = mapGroup.map((item: any) => item.activity);
    if (
      !mapGroupData.includes(item.activityDisplayName) &&
      item.activityType === 'WEB_SURF'
    ) {
      mapGroup.push({
        activity: item.activityDisplayName,
        type: item.activityType,
      });
    }
  });
  let groupData = mapGroup.map((item: any) => {
    const filter = value.filter(
      (value: any) => value.activityDisplayName === item.activity
    );
    const total = filter.reduce(
      (prev: any, { duration }: any) => prev + duration,
      0
    );
    return {
      total,
      type: item.type,
      activity: item.activity,
    };
  });

  return groupData;
};

export const totalWebsiteVisitTime = (value: any) => {
  let total: number = 0;
  value.forEach((item: any) => {
    if (item.activityType === 'WEB_SURF' && item.duration >= 0) {
      total += item.duration;
    }
  });

  return total;
};

export const totalAppUsageTime = (value: any) => {
  let total: number = 0;
  value.forEach((item: any) => {
    if (item.activityType === 'APP' && item.duration >= 0) {
      total += item.duration;
    }
  });

  return total;
};

export const getHexColorByIndex = (i) => {
  return hexColors[i] || 'ffffff';
};

export const timeFormat = (value: any) => {
  if (!value) return '<1m';

  const hours = Math.floor(value / 3600);
  let minutes: any = Math.floor((value - hours * 3600) / 60);
  let time = '';

  if (hours != 0) {
    time = `${hours}h`;
  }
  if (minutes != 0 || time !== '') {
    minutes = minutes < 10 && time !== '' ? '0' + minutes : String(minutes);
    time += ` ${minutes}m`;
  } else {
    time = '<1m';
  }

  return time;
};

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
