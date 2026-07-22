const callToService = async (url, body = JSON.stringify({})) => {
  const queryBody = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
  };
  try {
    await fetch(url, queryBody).then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    });
    return true;
  } catch (error) {
    return false;
  }
};

export default callToService;
