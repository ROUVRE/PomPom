import { useCallback } from "react";

const useNativeNotification = () => {
  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }, []);

  const triggerNotification = useCallback(
    (title, options = {}, soundUrl = null) => {
      if (!("Notification" in window) || Notification.permission !== "granted")
        return;

      if (soundUrl) {
        new Audio(soundUrl).play().catch(() => {});
      }

      const notification = new Notification(title, {
        ...options,
        vibrate: [200, 100, 200],
      });

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        notification.close();
      };
    },
    []
  );

  return { triggerNotification, requestPermission };
};

export default useNativeNotification;
