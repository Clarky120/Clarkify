export const getPlatform = () => {
  switch (process.platform) {
    case "win32":
      return "windows";
    case "darwin":
      return "mac";
    case "linux":
      return "linux";
    default:
      return "unknown";
  }
};
