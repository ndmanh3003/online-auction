export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isOTPExpired = (createdAt) => {
  const tenMinutes = 10 * 60 * 1000;
  return Date.now() - new Date(createdAt).getTime() > tenMinutes;
};
