type ChatItem = {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: number
    imageUrl?: string
    type?: "swap" | "vision" | "getDLMM" | "createPosition"
    props?: any
  }


  interface ApiResponse {
    result?: string
    content?: string
    toolResponses?: Array<{
      tool: string
      response: string
    }>
  }
  
  interface ProcessedResponse {
    responseText?: string
    responseComponent?: ChatItem
  }
  
  export function handleApiResponse(responseData: ApiResponse): ProcessedResponse {
    const processedResponse: ProcessedResponse = {}
  
    // Handle text response
    if (responseData.result || responseData.content) {
      processedResponse.responseText = responseData.result || responseData.content
    }
    
    // Handle tool responses
    if (responseData.toolResponses && responseData.toolResponses.length > 0) {
      const toolResponse = responseData.toolResponses[0]
      try {
        const parsedToolResponse = JSON.parse(toolResponse.response)
        const tool = toolResponse.tool
  
        if (tool === "requestSwapQuote") {
          processedResponse.responseComponent = {
            id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "swap",
            props: parsedToolResponse,
            content: "",
          }
        }
        if (tool === 'getDLMMPositions'){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "getDLMM",
            props: parsedToolResponse,
            content: "",
            }
        }

        if (tool === "createDLMMPosition"){
            processedResponse.responseComponent = {
                id: Date.now().toString(),
            role: "assistant",
            timestamp: Date.now(),
            type: "createPosition",
            props: parsedToolResponse,
            content: "",
            }
        }




        }
        
        
        
        catch (error) {
        console.error("Failed to parse tool response:", error)
      }
    }
  
    // Handle vision analysis response
    if (responseData.content && typeof responseData.content === "string") {
      processedResponse.responseComponent = {
        id: Date.now().toString(),
        role: "assistant",
        timestamp: Date.now(),
        type: "vision",
        props: { content: responseData.content },
        content: "",
      }
    }
  
    return processedResponse
  }