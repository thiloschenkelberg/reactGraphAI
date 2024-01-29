import { ObjectId } from "mongodb";

export interface IWorkflow {
    userId?: ObjectId
    workflow: string
    timestamp: Date
}