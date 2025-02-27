import { Link, Outlet, useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Header from "../Header.jsx";
import { fetchEvent, deleteEvent, queryClient } from "../../util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { mutate } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: 'none'
      });
      navigate("/events");
    },
  });

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["event", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  let content;

  if (isPending) {
    content = (
      <div id="event-details-content" className="center">
        <p>Fetching event data...</p>
        <LoadingIndicator />
      </div>
    );
  }

  if (isError) {
    content = (
      <div id="event-details-content" className="center">
        <ErrorBlock
          title="Failed to load event data"
          message={
            error.info?.message ||
            "Failed to fetch event details, Please try again later"
          }
        />
      </div>
    );
  }

  const handleDelete = () => {
    mutate({ id });
  };

  if (data) {
    const { title, description, image, location, date, time } = data;

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    content = (
      <>
        <header>
          <h1>{title}</h1>
          <nav>
            <button onClick={handleDelete}>Delete</button>
            <Link to="edit">Edit</Link>
          </nav>
        </header>
        <div id="event-details-content">
          <img src={`http://192.168.1.3:3000/${image}`} alt={title} />
          <div id="event-details-info">
            <div>
              <p id="event-details-location">{location}</p>
              <time dateTime={`Todo-DateT$Todo-Time`}>
                {formattedDate} @ {time}
              </time>
            </div>
            <p id="event-details-description">{description}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          View all Events
        </Link>
      </Header>
      <article id="event-details">{content}</article>
    </>
  );
}
