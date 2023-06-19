import React from "react"
import { useQuery } from "react-query"
import userService from "../client"

export default function BoardAdmin() {
  const { data, isLoading, error } = useQuery(
    "adminBoard",
    userService.getAdminBoard
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error instanceof Error) {
    return <div>An error occurred: {error.message}</div>
  }

  return (
    <div className="container">
      <header className="jumbotron">
        <h3>{data?.toString()}</h3>
      </header>
    </div>
  )
}
