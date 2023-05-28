import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortController = new AbortController(); //abort controller is a functionality built in the modern browsers
      activeHttpRequests.current.push(httpAbortController);

      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortController.signal,
        });

        const responseData = await response.json();

        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqContrl) => reqContrl !== httpAbortController
        ); //clear the abort controller that belong the requests that just completed

        if (!response.ok) {
          setIsLoading(false);
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        if (!err.message === "The user aborted a request.") {
          setError(err.message);
          setIsLoading(false);
          throw err;
        }
      }
    },
    []
  );
  const clearError = () => {
    setIsLoading(false);
    setError(null);
  };

  useEffect(() => {
    return () => {
      //cleanup function
      //eslint-disable-next-line react-hooks/exhaustive-deps
      activeHttpRequests.current.forEach((abcntrl) => abcntrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
