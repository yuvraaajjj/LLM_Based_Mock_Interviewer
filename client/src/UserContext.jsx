import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [id, setId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/loggedin", { withCredentials: true })
      .then(response => {
        const { userID, username } = response.data;
        setId(userID);
        setUsername(username);
      })
      .catch(() => {
        setId(null);
        setUsername(null);
      });
  }, []);

  return (
    <UserContext.Provider value={{ id, setId, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}
