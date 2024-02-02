import axios, { AxiosInstance } from "axios"
import { IOuterDictionary } from "./types/workflow.types"

const USER_API_URL = "https://reactgraphai.ew.r.appspot.com" //google app engine
const DATA_API_URL =  ""
// const API_URL = "http://localhost:8080" // local

function getCookie(name: string) {
  const cookieValue = document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(name))
    ?.split("=")[1]

  return cookieValue
}

class Client {
  private userClient: AxiosInstance
  private dataClient: AxiosInstance

  constructor() {
    this.userClient = axios.create({
      baseURL: USER_API_URL,
    })

    this.dataClient = axios.create({
      baseURL: DATA_API_URL
    })

    this.getCurrentUser = this.getCurrentUser.bind(this)
  }

  async login(email: string, password: string) {
    try {
      const response = await this.userClient.post("/api/users/login", {
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
      const response = await this.userClient.post("/api/users/register", {
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

      const response = await this.userClient.get("/api/users/current", {
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

      const response = await this.userClient.patch("/api/users/update/name", {
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

      const response = await this.userClient.patch("/api/users/update/username", {
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

      const response = await this.userClient.patch("/api/users/update/institution", {
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

      const response = await this.userClient.patch("/api/users/update/email", {
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

      const response = await this.userClient.patch("/api/users/update/password", {
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

      const response = await this.userClient.post("/api/users/authpass", {
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

      const response = await this.userClient.post("/api/users/update/img", formData, {
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

  async saveWorkflow(workflow: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.userClient.post("/api/users/workflows", {
        workflow
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while saving workflow!")
    }
  }

  async deleteWorkflow(workflowId: string) {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.userClient.delete(`/api/users/workflows/${workflowId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      return response
    } catch (err: any) {
      if (err.response?.data?.message) {
        err.message = err.response.data.message
        throw err
      }
      throw new Error("Unexpected error while deleting workflow!")
    }
  }

  async getWorkflows() {
    try {
      const token = getCookie("token")
      if (!token) {
        throw new Error("Token could not be retrieved!")
      }

      const response = await this.userClient.get(`/api/users/workflows`, {
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
      throw new Error("Unexpected error while retrieving workflows!")
    }
  }

  async workflowSearch(workflow: string | null) {
    try {
      const response = await this.dataClient.get("/api/search/fabrication-workflow", {
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

  // (file,context) => label_dict, file_link, file_name
  async requestExtractLabels(file: File, context: string) {
    try {
      const response = await this.dataClient.post("/api/file-retrieve", {
        params: {
          file: file,
          context: context,
        } 
      })

      if (!response || !response.data) {
        throw new Error()
      }

      return response.data
    } catch (err: any) {
      throw new Error("Unexpected error while extracting labels!")
    }
  }

  // (label_dict, context, file_link, file_name) => attribute_dict
  async requestExtractAttributes(dict: IOuterDictionary, context: string, link: string, name: string) {
    try {
      const response = await this.dataClient.post("/api/label-retrieve", {
        params: {
          label_dict: dict,
          context: context,
          file_link: link,
          file_name: name,
        }
      })

      if (!response || !response.data) {
        throw new Error()
      }

      return response.data
    } catch (err: any) {
      throw new Error("Unexpected error while extracting atributes!")
    }
  }

  // (attribute_dict, context, file_link, file_name) => node_json
  async requestExtractNodes(dict: IOuterDictionary, context: string, link: string, name: string) {
    try {
      const response = await this.dataClient.post("/api/attribute-retrieve", {
        params: {
          attribute_dict: dict,
          context: context,
          file_link: link,
          file_name: name,
        } 
      })

      if (!response || !response.data) {
        throw new Error()
      }

      return response.data
    } catch (err: any) {
      throw new Error("Unexpected error while extracting nodes!")
    }
  }

  // (node_json, context, file_link, file_name) => graph_json
  async requestExtractGraph(nodeJson: string, context: string, link: string, name: string) {
    try {
      const response = await this.dataClient.post("/api/", {
        params: {
          node_json: nodeJson,
          context: context,
          file_link: link,
          file_name: name,
        } 
      })

      if (!response || !response.data) {
        throw new Error()
      }

      return response.data
    } catch (err: any) {
      throw new Error("Unexpected error while extracting graph!")
    }
  }

}


const client = new Client()

export default client

