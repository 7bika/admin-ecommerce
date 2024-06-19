import React, { createContext, useState, useContext, useEffect } from "react";

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [newOrderCount, setNewOrderCount] = useState(0);
  const [newOrderIds, setNewOrderIds] = useState(new Set());

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:3000");

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "NEW_ORDER") {
        setNewOrderCount((prevCount) => prevCount + 1);
        setNewOrderIds((prevIds) => new Set(prevIds).add(message.order._id));
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const incrementNewOrderCount = (orderId) => {
    setNewOrderCount((prevCount) => prevCount + 1);
    setNewOrderIds((prevIds) => new Set(prevIds).add(orderId));
  };

  const markOrderAsViewed = (orderId) => {
    setNewOrderIds((prevIds) => {
      const updatedIds = new Set(prevIds);
      updatedIds.delete(orderId);
      setNewOrderCount(updatedIds.size);
      return updatedIds;
    });
  };

  return (
    <NotificationContext.Provider
      value={{
        newOrderCount,
        newOrderIds,
        incrementNewOrderCount,
        markOrderAsViewed,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
