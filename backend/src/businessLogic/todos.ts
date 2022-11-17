import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'
import { 
    createTodoItem, 
    deleteTodoItem, 
    getTodoItemById, 
    getUsersTodoItems, 
    updateTodoItem, 
    updateTodoItemAttachment } from '../helper/todosAcess'
import { getSignedUploadUrl } from '../aws-services/storage'

// TODO: Implement businessLogic
export const createTodo = async (TodoRequest:CreateTodoRequest, userId:string) :Promise<TodoItem> => {
    const todoId = uuid.v4()
    
    return await createTodoItem({
        todoId:todoId,
        userId: userId,
        name: TodoRequest.name,
        dueDate: TodoRequest.dueDate,
        done: false,
        createdAt: new Date().toISOString()  
    })

}

export const getUsersTodo = async (userId: string) => {

    return getUsersTodoItems(userId)    
}

export const deleteTodo = async (userId: string,todoId: string) => {

    return deleteTodoItem(userId, todoId)
}

export const updateTodo = async (todoRequest: UpdateTodoRequest, todoId: string, userId: string) => {

    const todoUpdate:TodoUpdate = {
        ...todoRequest
    }
    
    return updateTodoItem(todoUpdate, todoId, userId)   
}

export  const updateTodoAttachment = (todoItem: TodoItem) => {
    return updateTodoItemAttachment(todoItem)    
}

export async function generateUploadUrl(todoId: string) {
    return getSignedUploadUrl(todoId)    
}

export async function getTodoById(todoId: string) {
    return getTodoItemById(todoId)    
}