export const fetchEvents = async ({signal, searchTerm}) => {
  let url = "http://192.168.1.3:3000/events";

  if(searchTerm){
    url += "?search=" + searchTerm
  }

  const response = await fetch(url, {signal});

  if (!response.ok) {
    const error = new Error("An error occurred while fetching the events");
    error.code = response.status;
    error.info = await response.json();
    throw error;
  }

  const { events } = await response.json();

  return events;
};
