export const returnSuccess = (data: any) => {
    return {
        success: true,
        data
    }
}
export const returnError = (message: string) => {
    return {
        success: false,
        message
    }
}
