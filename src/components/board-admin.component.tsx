import React from "react";
import { useQuery } from "react-query";
import userService from "../services/user.service";

export default function BoardAdmin() {
  const { data, error, isLoading } = useQuery("adminBoard", userService.getAdminBoard);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    const errorMessage = error.response?.data?.message || error.message || error.toString();
    return <div>{errorMessage}</div>;
  }

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{data}</h3>
      </header>
    </div>
  );
}
