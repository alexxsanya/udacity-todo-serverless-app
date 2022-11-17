import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createDynamoDBClient } from '../aws-services/database'

const logger = createLogger('TodosAccess')

const docClient:DocumentClient =  createDynamoDBClient();
const todoTable = process.env.TODOS_TABLE;
const indexTable = process.env.TODOS_CREATED_AT_INDEX;


export const createTodoItem = async (todoItem: TodoItem) :Promise<TodoItem> => {

    await docClient.put(
        {
            TableName: todoTable,
            Item: todoItem
        }
    ).promise()

    logger.info("New todo item has been created successfully")

    return todoItem
}

export const getUsersTodoItems = async (userId: string): Promise<TodoItem []> =>{

    const results = await docClient.query(
        {
            TableName: todoTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }
    ).promise()

    const items = results.Items 
    logger.info("Get all users todo item", userId)

    return items as TodoItem[]
}


export const updateTodoItemAttachment = async (todoItem:TodoItem) => {
        
    await docClient.update({
        TableName: todoTable,
        Key:{
            todoId: todoItem.todoId,
            userId: todoItem.userId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
            ':attachmentUrl': todoItem.attachmentUrl
        }
    }).promise()

    logger.info(`updated todo item attachment for itemm_id - ${todoItem.todoId}`)

}

export const updateTodoItem = async (todoUpdate: TodoUpdate, todoId: string, userId: string) => {
    
    await docClient.update(
        {
            TableName: todoTable,
            Key: {
                "userId": userId,
                "todoId": todoId
            },
            
            UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeValues:{
                ":name": todoUpdate.name,
                ":dueDate" : todoUpdate.dueDate,
                ":done" : todoUpdate.done
            },
            ReturnValues: "ALL_NEW"
        }
    ).promise()

    logger.info(`Todo Item id - ${todoId} has been updated successfully`)

}

export const getTodoItemById = async (todoId:string) :Promise<TodoItem> => { 

    const results = await docClient.query({
        TableName: todoTable,
        IndexName: indexTable,
        KeyConditionExpression: 'todoId = :todoId',
        ExpressionAttributeValues:{
            ':todoId':todoId
        }
    }
    ).promise()

    logger.info(`retrieved todo item id : ${todoId} `)

    return results.Items[0] as TodoItem
}

export const deleteTodoItem = async (userId: string, todoId: string) =>  {

    await docClient.delete({
        TableName: todoTable,
        Key: {
            "userId": userId,
            "todoId": todoId
        },
    }).promise()

    logger.info(`Todo item - id: ${todoId} has been deleted`)
}
