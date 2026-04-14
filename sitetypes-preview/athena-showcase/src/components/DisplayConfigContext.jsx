import React, { createContext, useContext, useState } from 'react';

const DisplayConfigContext = createContext();

export const DisplayConfigProvider = ({ children, data }) => {
  const [config, setConfig] = useState(data?.site_settings?.display || {});

  return (
    <DisplayConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </DisplayConfigContext.Provider>
  );
};

export const useDisplayConfig = () => useContext(DisplayConfigContext);
