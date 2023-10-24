import axios, { AxiosInstance } from "axios"

const API_URL = "http://localhost:8000"

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(name))
    ?.split("=")[1]

  return cookieValue
}

class Client {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
    })

    this.getCurrentUser = this.getCurrentUser.bind(this)
  }

  async login(email: string, password: string) {
    try {
      const response = await this.client.post("/api/users/login", {
        email,
        password,
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while logging in!") 
    }
  }

  async register(username: string, email: string, password: string) {
    try {
      const response = await this.client.post("/api/users/register", {
        username,
        email,
        password,
      })
      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while registering!") 
    }
  }

  async getCurrentUser() {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.get("/api/users/current", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }) // user json

      return response.data.user
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      } else if (err.message) {
        throw err
      } else {
        throw new Error("Unexpected error while retrieving user!")
      }
    }
  }

  async updateName(name: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.patch("/api/users/update/name", {
        name
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while updating name!")
    }
  }

  async updateUsername(username: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.patch("/api/users/update/username", {
        username
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 409) {
          throw new Error("Username already in use!")
        }
        if (err.response.data?.message) {
          err.message = err.response.data.message
          throw err
        }
      }
      throw new Error("Unexpected error while updating username!")
    }
  }

  async updateInstitution(institution: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.patch("/api/users/update/institution", {
        institution
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      })

      return response
    } catch (err: any) {
      if (err.response) {
        if (err.response.data?.message) {
          err.message = err.response.data.message
          throw err
        }
      }
      throw new Error("Unexpected error while updating institution!")
    }
  }

  async updateMail(newMail: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.patch("/api/users/update/email", {
        newMail
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response
    } catch (err: any) {
      if (err.response) {
        if (err.response.status === 409) {
          throw new Error('Email is already in use!')
        }
        if (err.response.data?.message) {
          err.message = err.response.data.message
          throw err
        }
      }
      throw new Error("Unexpected error while updating mail!")
    }
  }

  async updatePassword(newPass: string, oldPass: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.patch("/api/users/update/password", {
        newPass,
        oldPass
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while updating password!")
    }
  }

  async authenticatePassword(password: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.client.post("/api/users/authpass", {
        password
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while authenticating!")
    }
  }

  async updateUserImg(img: File) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const formData = new FormData()
      formData.append('image', img)

      const response = await this.client.post("/api/users/update/img", formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      } else if (err.message) {
        throw err
      }
      throw new Error("Unexpected error while updating user image!")
    }
  }

  async workflowSearch(workflow: string | null) {
    try {
      const response = await this.client.get("/api/search/fabrication-workflow", {
        params: {
          workflow,
        },
        responseType: 'blob'
      })
      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error in workflow query.")
    }
  }
}

const client = new Client()

export default client
