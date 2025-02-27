import {
  Link,
  redirect,
  useNavigate,
  useNavigation,
  useParams,
  useSubmit,
} from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();
  const submit = useSubmit();
  const { state } = useNavigation();

  const {
    data: event,
    isError,
    error,
  } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
    staleTime: 10000
  });

  // const { mutate } = useMutation({
  //   mutationFn: updateEvent,
  //   onMutate: async ({ event }) => {
  //     const newEventData = event;

  //     await queryClient.cancelQueries(["events", id]);
  //     const prevEventData = queryClient.getQueryData(["events", id]);

  //     queryClient.setQueryData(["events", id], newEventData);

  //     return {
  //       prevEventData,
  //     };
  //   },
  //   onError: ({}, {}, context) => {
  //     queryClient.setQueryData(["events", id], context.prevEventData);
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries({ queryKey: ["events", id] });
  //   },
  // });

  function handleSubmit(formData) {
    submit(formData, { method: "PUT" });
    // mutate({ event: formData, id });
    // navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  let content;

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load event data"
          message={
            error.info?.message ||
            "Failed to fetch event data, Please try again later"
          }
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (event) {
    content = (
      <div className="center">
        <EventForm inputData={event} onSubmit={handleSubmit}>
          {state === "submitting" ? (
            <p>Sending Data...</p>
          ) : (
            <>
              <Link to="../" className="button-text">
                Cancel
              </Link>
              <button type="submit" className="button">
                Update
              </button>
            </>
          )}
        </EventForm>
      </div>
    );
  }

  return (
    <>
      <Modal onClose={handleClose}>{content}</Modal>
    </>
  );
}

export const loader = ({ params }) => {
  const id = params.id;

  return queryClient.fetchQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });
};

export const action = async ({ request, params }) => {
  const { id } = params;
  const formData = await request.formData();
  const updatedEventData = Object.fromEntries(formData);

  await updateEvent({ id, event: updatedEventData });
  await queryClient.invalidateQueries(["events"]);

  return redirect("../");
};
