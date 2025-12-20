import { useCallback } from "react";

const useNativeNotification = () => {
  const triggerNotification = useCallback((title, options = {}) => {
    if (!("Notification" in window)) return;

    const createNotify = () => {
      const notification = new Notification(title, options);

      notification.onclick = function (event) {
        event.preventDefault();
        window.focus();
        notification.close();
      };
    };

    if (Notification.permission === "granted") {
      createNotify();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") createNotify();
      });
    }
  }, []);

  return { triggerNotification };
};

export default useNativeNotification;
