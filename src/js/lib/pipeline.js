export const make = (fns) => {
  return (value) => {
    const fn = fns[0];
    if (!fn) return value;

    return fn(
      make(fns.slice(1)),
      value,
    );
  };
};
