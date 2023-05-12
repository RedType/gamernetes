export const expectEnv = (variableName: string) => {
  const value = process.env[variableName];
  if (value === null || value === undefined || value === '') {
    throw new Error('Missing expected env variable ' + variableName);
  } else {
    return value;
  }
};

export const lazy = <T>(producer: () => T) => {
  let t: T | undefined;

  return () => {
    if (t === undefined) {
      t = producer();
    }

    return t;
  };
};

