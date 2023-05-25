import React, { useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import { useForm } from "../../shared/hooks/form";
import { useHttpClient } from "../../shared/hooks/http-hook";

import "./PlaceForm.css";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import { AuthContext } from "../../shared/context/auth-context";

const UpdatePlaces = () => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedplace, setLoadedPlace] = useState();
  const placeId = useParams().placeId;
  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  useEffect(() => {
    const fetchPlace = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:8000/api/places/${placeId}`
        );
        setLoadedPlace(responseData.place);
        setFormData({
          title: {
            value: responseData.place.title,
            isValid: false,
          },
          description: {
            value: responseData.place.description,
            isValid: false,
          },
        });
      } catch (err) {}
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  const updateSubmitHandler = async (event) => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:8000/api/places/${placeId}`,
        "PATCH",
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value,
        }),
        { "Content-Type": "application/json" }
      );
      history.push("/" + auth.userId + "/places");
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedplace && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Couldn't find place</h2>
        </Card>
      </div>
    );
  }
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedplace && (
        <form className="place-form" onSubmit={updateSubmitHandler}>
          <Input
            id="title"
            element="input"
            type="text"
            label="title"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter valid title"
            onInput={inputHandler}
            initialValue={loadedplace.title}
            initialValid={true}
          />
          <Input
            id="description"
            element="textarea"
            label="description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter valid description"
            onInput={inputHandler}
            initialValue={loadedplace.description}
            initialValid={true}
          />

          <Button type="submit" disabled={!formState.isValid}>
            Update Place
          </Button>
        </form>
      )}
    </React.Fragment>
  );
};

export default UpdatePlaces;
