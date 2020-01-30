exports.checkStatus = async (response) => {
  if (response.ok) {
    return await response.json();
  } else {
    const error = new Error(response.statusText);
    error.response = await response.json();
    return Promise.reject(error);
  }
};
